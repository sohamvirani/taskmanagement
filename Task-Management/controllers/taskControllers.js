const Task  = require("../models/taskModel")
const User = require("../models/userModel")
const checkAndUpdateOverdueTasks = require("../util/overDueTask")

exports.create = async (req, res) => {
    try {
        
        const { title, description, assignedUser, dueDate, status } = req.body;

      
        if (!title || !description || !assignedUser || !dueDate) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
     
       
         const user = await User.findById(assignedUser);
         if (!user) {
             return res.status(404).json({
                 success: false,
                 message: 'User not found',
             });
         }
 
      
         if (user.role_id === 'user') {
             const taskCount = await Task.countDocuments({ assignedUser: user._id });
             if (taskCount >= 10) {
                 return res.status(403).json({
                     success: false,
                     message: 'You can only create a maximum of 10 tasks.',
                 });
             }
         }
        
        const newTask = new Task({
            title,
            description,
            assignedUser,
            dueDate,
            status: status || 'pending'  
        });

        
        await newTask.save();

        
        return res.status(201).json({
            success: true,
            message: 'Task created successfully',
            task: newTask
        });
    } catch (error) {
        console.error('Error creating task:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

exports.view = async (req, res) => {
        try {
    
            await checkAndUpdateOverdueTasks();
        
            const tasks = await Task.find().populate('assignedUser', 'username email');
    
            res.status(200).json({
                success: true,
                tasks
            });
        } catch (error) {
            console.error('Error fetching tasks:', error.message);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
};


exports.update = async (req, res) => {

    try {
        const taskId = req.params.id;
        const updates = req.body;

       
        const updatedTask = await Task.findByIdAndUpdate(taskId, updates, { new: true, runValidators: true });

       
        if (!updatedTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

       
        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            task: updatedTask
        });
    } catch (error) {
        console.error('Error updating task:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}

exports.deletedTask = async (req,res) => {

    try {
        const taskId = req.params.id;

       
        const deletedTask = await Task.findByIdAndDelete(taskId);

       
        if (!deletedTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

       
        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
            
        });
    } catch (error) {
        console.error('Error deleting task:', error.message);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
}



exports.filterSorting = async (req, res) => {
    try {
       
        const { status, sortBy } = req.query;

      
        const filter = {};
        if (status) {
            filter.status = status; 
        }

        
        let sort = {};
        if (sortBy) {
            const parts = sortBy.split(':'); 
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        }

       
        const tasks = await Task.find(filter).sort(sort);

        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
};






