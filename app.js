const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Json File Path
const tasksFilePath = path.join(__dirname, 'task.json');

app.listen(port, (err) => {
    if (err) {
        return console.log('Something went wrong!', err);
    }
    console.log(`Server is listening on ${port}`);
});


function readTasks() {
    const data = fs.readFileSync(tasksFilePath, 'utf8');
    return JSON.parse(data).tasks; // Parse and return the tasks array
}

function writeTasks(tasks) {
    fs.writeFileSync(tasksFilePath, JSON.stringify({ tasks }, null, 2));
}

// Get all tasks
app.get('/tasks/', (req, res) => {
    const tasks = readTasks();
    const { completed } = req.query;

    if (completed !== undefined) {
        const isCompleted = completed === 'true';
        const filteredTasks = tasks.filter((task) => task.completed === isCompleted);
        return res.json(filteredTasks);
    }

    res.json(tasks);
});

// Get single task
app.get('/tasks/:id', (req, res) => {
    const tasks = readTasks();
    const task = tasks.find((task) => task.id === Number(req.params.id));
    task ? res.json(task) : res.status(404).json({ message: 'Task not found' });
});

// Create a new task
app.post('/tasks', (req, res) => {
    const tasks = readTasks();
    const newTask = {
        id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
        title: req.body.title,
        description: req.body.description,
        completed: req.body.completed || false,
    };
    
    tasks.push(newTask);
    writeTasks(tasks);
    res.status(201).json(newTask);
});


// Update a task by ID
app.put('/tasks/:id', (req, res) => {
    const tasks = readTasks();
    const index = tasks.findIndex((task) => task.id === Number(req.params.id));
  
    if (index === -1) return res.status(404).json({ message: 'Task not found' });
  
    tasks[index] = { ...tasks[index], ...req.body };
    writeTasks(tasks);
    res.json(tasks[index]);
});


// Delete a task
app.delete('/tasks/:id', (req, res) => {
    const tasks = readTasks();
    const taskIndex = tasks.findIndex((task) => task.id === Number(req.params.id));

    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }

    tasks.splice(taskIndex, 1);
    writeTasks(tasks);

    res.status(204).send(); 
});

module.exports = app;