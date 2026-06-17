'use strict';

const { Op } = require('sequelize');
const { User, Facility } = require('../models');
const { successResponse, errorResponse } = require('../utils/response');
const { v4: uuidv4 } = require('uuid')
const mailService = require('../services/mail.service');

const RESULT_INCLUDES = [
    {
        model: Facility,
        attributes: ['facility_id', 'facility_name'],
        required: false,
    },
];

const getUsers = async (req, res) => {
    try {
        const {
            search,
            role,
            facility_id,
            status,
            page = 1,
            limit = 50,
        } = req.query;

        const where = {
            organization_id: req.user.organization_id,
        };

        if (req.user.facility_id) {
            where.facility_id = req.user.facility_id;
        }

        if (role) where.role = role;
        if (status) where.status = status;
        if (facility_id) where.facility_id = facility_id;

        if (search) {
            const like = `%${search.trim()}%`;
            where[Op.or] = [
                { first_name: { [Op.iLike]: like } },
                { last_name: { [Op.iLike]: like } },
                { email: { [Op.iLike]: like } },
                { '$Facility.facility_name$': { [Op.iLike]: like } },
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { count, rows } = await User.findAndCountAll({
            where,
            include: RESULT_INCLUDES,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset,
            subQuery: false,
            attributes: { exclude: ['password_hash'] },
        });

        return successResponse(res, {
            users: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / parseInt(limit)),
            },
        });
    } catch (err) {
        console.error('[getUsers]', err.message);
        return errorResponse(res, 'Failed to fetch users.', 500);
    }

};

const createUser = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            role,
            facility_id,
        } = req.body

        if (!first_name || !last_name || !email || !role || !facility_id) {
            return errorResponse(res, 'first_name, last_name, email, role and facility_id are required.', 400)
        }

        const existing = await User.findOne({ where: { email: email.toLowerCase().trim() } })
        if (existing) {
            return errorResponse(res, 'A user with this email already exists.', 409)
        }

        const tempPassword = uuidv4().slice(0, 12)
        const password_hash = await User.hashPassword(tempPassword)

        const user = await User.create({
            organization_id: req.user.organization_id,
            facility_id,
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: email.toLowerCase().trim(),
            password_hash,
            role,
            status: 'Invited',
            web_access_enabled: role !== 'Testing Staff',
        })

        if (mailService.isConfigured) {
            mailService.sendInvite({
                to: user.email,
                firstName: user.first_name,
                tempPassword,
            }).catch(err => {
                console.error('[createUser] Background invite email failed:', err.message)
            })
        }

        const responseData = {
            user: {
                user_id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                status: user.status,
                email_sent: mailService.isConfigured,
            }
        }

        if (!mailService.isConfigured) {
            responseData.temp_password = tempPassword
        }

        return successResponse(res, responseData, 'User created successfully.', 201)
    } catch (err) {
        console.error('[createUser]', err.message)
        return errorResponse(res, 'Failed to create user.', 500)
    }
}

const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const {
            first_name,
            last_name,
            email,
            role,
            facility_id,
        } = req.body

        if (!first_name || !last_name || !email || !role || !facility_id) {
            return errorResponse(res, 'first_name, last_name, email, role and facility_id are required.', 400)
        }

        const user = await User.findOne({
            where: { user_id: id, organization_id: req.user.organization_id },
        })

        if (!user) {
            return errorResponse(res, 'User not found.', 404)
        }

        const normalizedEmail = email.toLowerCase().trim()

        if (normalizedEmail !== user.email) {
            const existing = await User.findOne({ where: { email: normalizedEmail } })
            if (existing) {
                return errorResponse(res, 'A user with this email already exists.', 409)
            }
        }

        await user.update({
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: normalizedEmail,
            role,
            facility_id,
            web_access_enabled: role !== 'Testing Staff',
        })

        return successResponse(res, {
            user: {
                user_id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                status: user.status,
            }
        }, 'User updated successfully.')
    } catch (err) {
        console.error('[updateUser]', err.message)
        return errorResponse(res, 'Failed to update user.', 500)
    }
}

const setUserStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const ALLOWED_STATUSES = ['Active', 'Inactive']
        if (!ALLOWED_STATUSES.includes(status)) {
            return errorResponse(res, `status must be one of: ${ALLOWED_STATUSES.join(', ')}.`, 400)
        }

        const user = await User.findOne({
            where: { user_id: id, organization_id: req.user.organization_id },
        })

        if (!user) {
            return errorResponse(res, 'User not found.', 404)
        }

        if (user.user_id === req.user.user_id) {
            return errorResponse(res, 'You cannot change your own account status.', 400)
        }

        if (user.status === status) {
            return errorResponse(res, `User is already ${status.toLowerCase()}.`, 409)
        }

        await user.update({
            status,
            web_access_enabled: status === 'Active' ? user.role !== 'Testing Staff' : false,
        })

        return successResponse(res, {
            user: {
                user_id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                status: user.status,
            }
        }, status === 'Active' ? 'User reactivated successfully.' : 'User deactivated successfully.')
    } catch (err) {
        console.error('[setUserStatus]', err.message)
        return errorResponse(res, 'Failed to update user status.', 500)
    }
}

module.exports = { getUsers, createUser, updateUser, setUserStatus }