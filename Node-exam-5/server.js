const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data storage
let courses = [
    { id: 1, name: "Initial Course", category: "Programming", instructor: "Jane Doe", duration: 15 }
];

// Middleware to check for missing data
function checkCourseData(req, res, next) {
    const { name, category, instructor, duration } = req.body;
    if (!name || !category || !instructor || !duration) {
        return res.status(400).send('All fields are required');
    }
    req.body.duration = Number(duration);
    next();
}

// GET Route for Welcome Message
app.get('/', (req, res) => {
    res.send('Welcome to the Online Course Management API.');
});

// GET Route for Course Listing
app.get('/courses', (req, res) => {
    res.json(courses);
});

// Serve HTML for course list
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve HTML for adding courses
app.get('/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'addCourse.html'));
});

// POST Route for Adding Courses
app.post('/courses/add', checkCourseData, (req, res) => {
    const newCourse = {
        id: courses.length + 1,
        ...req.body
    };
    courses.push(newCourse);
    res.json(courses);
});

// PATCH Route for Updating Courses
app.patch('/courses/update/:id', checkCourseData, (req, res) => {
    const courseId = parseInt(req.params.id);
    const index = courses.findIndex(course => course.id === courseId);
    if (index === -1) return res.status(404).send('Course not found');

    courses[index] = { ...courses[index], ...req.body };
    res.json(courses);
});

// DELETE Route for Removing Courses
app.delete('/courses/delete/:id', (req, res) => {
    const courseId = parseInt(req.params.id);
    courses = courses.filter(course => course.id !== courseId);
    res.json(courses);
});

// GET Route for Filtering Courses
app.get('/courses/filter', (req, res) => {
    let filteredCourses = courses;
    const { category, instructor, duration } = req.query;

    if (category) filteredCourses = filteredCourses.filter(course => course.category === category);
    if (instructor) filteredCourses = filteredCourses.filter(course => course.instructor === instructor);
    if (duration) filteredCourses = filteredCourses.filter(course => course.duration === Number(duration));

    res.json(filteredCourses);
});

// GET Route for Course Detail
app.get('/courses/:id', (req, res) => {
    const courseId = parseInt(req.params.id);
    const course = courses.find(c => c.id === courseId);
    if (!course) return res.status(404).send('Course not found');
    res.json(course);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
