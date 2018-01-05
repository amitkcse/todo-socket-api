var express = require('express')
var app = express();
var socket = require('socket.io');
var mongoose = require('mongoose');
var Task = require('./models/taskModel');
var bodyParser = require('body-parser');
const cors = require('cors');
// const MongooseTrigger = require('mongoose-trigger');
app.use(cors({
  origin: 'http://192.168.0.97:3000',
  credentials: true
}));

var port =  process.env.PORT || 3051;

var db = mongoose.connect('mongodb://localhost:27017/todo', (err, db)=> {
    if (err) {
        console.log('Unable to connect to the server. Please start the server. Error:', err);
    } else {
        console.log('Connected to Server successfully!');
    }
});

var server = app.listen(port, ()=>{
    console.log('app running on port', port, process.env.PORT);
});

var io = socket(server);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('add-task', function(data) {
    console.log('add-task called with data', data);
    if(data.title && data.text){
      var task = new Task({title: data.title, text: data.text});
      task.save((err, createdTask)=> {
          if (err) {
            console.log('Task is not added');
        } else{
            io.emit('task-added', createdTask);
            // socket.emit('task-added', createdTask);
            // socket.broadcast.emit('task-added', createdTask);
          }
        })
      } else{}
   });

  socket.on('update-task', function(data) {
    if(data._id && data.title && data.text){
        Task.findByIdAndUpdate(data._id, {$set:{title : data.title, text: data.text}}, {new: true},function(err, updatedTask){
        if(err){console.log('error')
      } else {

        io.emit('task-updated', updatedTask);
        //socket.broadcast.emit('task-updated', updatedTask);
      }}
    )};
  })

  socket.on('delete-task', function(data) {
    if(data._id){
      Task.findByIdAndRemove(data._id, (err, deletedTask)=>{
        if(err){
          console.log('task not deleted'); }
          else{
            // have to broadcast here
          socket.broadcast.emit('task-deleted', deletedTask)
        }
      })
    } else{}
  })
})




app.get('/', (req, res)=> {
  res.send('hello world');
})

app.post('/view-tasks', (req, res)=>{
    Task.find( (err, tasks)=>{
     if(err){
       console.log('Something wrong happened...');
     } else {
       res.json(tasks);
     }

   })
})

// app.post('/add-task', (req, res)=>{
//   if(req.body.title && req.body.text){
//     var task = new Task({title: req.body.title, text: req.body.text});
//     task.save((err, createdTask)=> {
//         if (err) {
//           console.log('Task is not added');
//           res.json({isTaskAdded: false, message: 'Task not added. Please try again'})
//         } else{
//             res.json({isTaskAdded: true, task: createdTask, message: 'task added successfully'})
//         }
//     })
//   } else{
//         res.json({isTaskAdded: false, message: 'Task title text can not be null'});
//   }
// })
//
//
// app.post('/update-task', (req, res)=>{
//     if((req.body._id && req.body.title && req.body.text)){
//       Task.findById(req.body._id, (err, task)=>{
//         if (err) {
//         res.json({isTaskUpdated: false, message: 'somme error occured'});
//     } else {
//       task.title= req.body.title;
//       task.text= req.body.text;
//       task.save((err, updatedTask)=>{
//         if(err){
//           res.json({isTaskUpdated: false, message: 'somme error occured'});
//         } else {
//           res.json({isTaskUpdated: true, task: updatedTask, message: 'task updated successfully'})
//         }
//       })
//     }
//       })
//     } else{
//       res.json({isTaskUpdated: false, message: 'some error occured, task not updated'});
//     }
// })
//
// app.post('/delete-task', (req, res)=>{
//     if(req.body._id){
//       Task.findByIdAndRemove(req.body._id, (err, task)=>{
//         if(err){
//           res.json({isTaskDeleted: false, message: 'task not deleted'});
//         } else{
//           res.json({ isTaskDeleted: true, task: task, message:'task deleted successfully'})
//         }
//       })
//     } else{
//       res.json({isTaskDeleted: false, message: 'task not deleted'});
//     }
// })
