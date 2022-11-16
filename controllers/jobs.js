const Job = require('../models/Jobs');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

const getAllJobs = async (req, res) => {
    // fetching all the jobs created by user
    const jobs = await Job.find({
        createdBy: req.user.userId
    }).sort('createdBy');

    // Sending response
    res.status(StatusCodes.OK).json({
        jobs,
        count: jobs.length
    });
}

const getJob = async (req, res) => {
    // Fetch the userId from auth middleware(req.user.userId) & jobId from params(req.params.id)
    const {
        user: { userId },
        params: { id: jobId }
    } = req;

    // Now getting the job based on jobId & userId
    const job = await Job.findOne({
        _id: jobId,
        createdBy: userId
    });

    if (!job) {
        throw new NotFoundError(`Job doesnot exist with Job ID: ${jobId}`);
    }

    // Sending response
    res.status(StatusCodes.OK).json({ job });
}

const createJob = async (req, res) => {
    // Getting the createdBy from auth middleware placed in app.js while calling jobsRouter
    req.body.createdBy = req.user.userId;
    // Now we'll create the job after getting the createdBy value
    const job = await Job.create(req.body);
    // Sending response
    res.status(StatusCodes.CREATED).json({ job });
}

const updateJob = async (req, res) => {
    const {
        body: { company, position },
        user: { userId },
        params: { id: jobId }
    } = req;

    if (!company || !position) {
        throw new BadRequestError(`Company and Position cannot be empty`);
    }

    const job = await Job.findOneAndUpdate(
        {
            _id: jobId,
            createdBy: userId
        },
        req.body,
        {
            new: true,
            runValidators: true
        }
    )

    if (!job) {
        throw new NotFoundError(`No job exist with Job ID ${jobId}`);
    }

    res.status(StatusCodes.OK).json({ job });
}

const deleteJob = async (req, res) => {
    const {
        user: { userId },
        params: { id: jobId }
    } = req;

    const job = await Job.findByIdAndRemove({
        _id: jobId,
        createdBy: userId
    });

    if (!job) {
        throw new NotFoundError(`Job doesnot exist with Job ID ${jobId}`);
    }

    res.status(StatusCodes.OK).send(`Job with Job ID ${jobId} is deleted`);
}

module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob
}