import { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import EditTodo from "./EditTodo";

const Task = ({ task, onEdit, onDelete }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} className={`card p-3 mb-3 shadow-sm ${isDragging ? "opacity-50" : ""}`}>
      <h5 className="card-title">{task.title}</h5>
      <p className="card-text">{task.description}</p>
      <div className="d-flex justify-content-between">
        <button className="btn btn-warning btn-sm" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

const Lane = ({ status, tasks, moveTask, onEdit, onDelete }) => {
  const [, drop] = useDrop({
    accept: "TASK",
    drop: (item) => moveTask(item.id, status),
  });

  return (
    <div ref={drop} className="col bg-light p-3 rounded shadow-sm d-flex flex-column">
      <h4 className="text-center mb-3">{status}</h4>
      <div className="flex-grow-1">
        {tasks.map((task) => (
          <Task key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
      <div className="text-center mt-3 p-2 bg-white rounded shadow-sm">
        <strong>{tasks.length}</strong> {tasks.length === 1 ? "Task" : "Tasks"}
      </div>
    </div>
  );
};

const TaskCreator = ({ onAdd }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (title.trim() && description.trim()) {
      onAdd(title, description);
      setTitle("");
      setDescription("");
    }
  };

  return (
    <div className="mb-4 d-flex gap-2">
      <input
        type="text"
        className="form-control"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        className="form-control"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button className="btn btn-primary" onClick={handleAdd}>
        Add Task
      </button>
    </div>
  );
};

export default function TrelloBoard() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetch("https://dummyjson.com/todos")
      .then((res) => res.json())
      .then((data) => {
        const formattedTasks = data.todos.map((todo) => ({
          id: todo.id,
          title: `Task ${todo.id}`,
          description: todo.todo,
          status: todo.completed ? "Done" : "To Do",
        }));
        setTasks(formattedTasks);
      });
  }, []);

  const moveTask = (taskId, newStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const addTask = (title, description) => {
    const newTask = {
      id: tasks.length + 1,
      title,
      description,
      status: "To Do",
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const editTask = (task) => setEditingTask(task);

  const updateTask = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    setEditingTask(null);
  };

  const deleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container py-4">
        <TaskCreator onAdd={addTask} />
        <div className="row g-3">
          {["To Do", "In Progress", "Done"].map((status) => (
            <Lane
              key={status}
              status={status}
              tasks={tasks.filter((task) => task.status === status)}
              moveTask={moveTask}
              onEdit={editTask}
              onDelete={deleteTask}
            />
          ))}
        </div>
        {editingTask && (
          <EditTodo
            task={editingTask}
            updateTask={updateTask}
            onClose={() => setEditingTask(null)}
          />
        )}
      </div>
    </DndProvider>
  );
}
