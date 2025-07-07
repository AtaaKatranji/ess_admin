"use client";
import React, { useState } from 'react';
import { Edit, Trash2, CheckCircle, PlusCircle } from 'lucide-react';

interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  subTasks: SubTask[];
}

const TaskPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Task 1',
      description: 'Complete project A',
      isCompleted: false,
      subTasks: [
        { id: '1-1', title: 'Design database schema', isCompleted: false },
        { id: '1-2', title: 'Create API endpoints', isCompleted: true },
      ],
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Prepare for meeting',
      isCompleted: true,
      subTasks: [],
    },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);

  const handleAddTask = () => {
    if (newTaskTitle && newTaskDescription) {
      const newTask = {
        id: Math.random().toString(36).substr(2, 9),
        title: newTaskTitle,
        description: newTaskDescription,
        isCompleted: false,
        subTasks: [],
      };
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setNewTaskTitle('');
      setNewTaskDescription('');
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const handleEditTask = (id: string) => {
    const taskToEdit = tasks.find((task) => task.id === id);
    if (taskToEdit) {
      setNewTaskTitle(taskToEdit.title);
      setNewTaskDescription(taskToEdit.description);
      setIsEditing(true);
      setEditTaskId(id);
    }
  };

  const handleUpdateTask = () => {
    if (editTaskId && newTaskTitle && newTaskDescription) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editTaskId
            ? { ...task, title: newTaskTitle, description: newTaskDescription }
            : task
        )
      );
      setIsEditing(false);
      setEditTaskId(null);
      setNewTaskTitle('');
      setNewTaskDescription('');
    }
  };

  const handleToggleTaskCompletion = (id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const handleAddSubTask = (taskId: string, subTaskTitle: string) => {
    if (subTaskTitle) {
      const newSubTask = {
        id: Math.random().toString(36).substr(2, 9),
        title: subTaskTitle,
        isCompleted: false,
      };
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, subTasks: [...task.subTasks, newSubTask] }
            : task
        )
      );
    }
  };

  const handleToggleSubTaskCompletion = (taskId: string, subTaskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subTasks: task.subTasks.map((subTask) =>
                subTask.id === subTaskId
                  ? { ...subTask, isCompleted: !subTask.isCompleted }
                  : subTask
              ),
            }
          : task
      )
    );
  };

  const handleDeleteSubTask = (taskId: string, subTaskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subTasks: task.subTasks.filter((subTask) => subTask.id !== subTaskId),
            }
          : task
      )
    );
  };

  return (
    <div className="w-full max-w-screen-md mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Task Management</h1>

      {/* Add/Edit Task Form */}
      <div className="mb-6 p-4 border rounded shadow">
        <h2 className="text-xl font-semibold mb-2">{isEditing ? 'Edit Task' : 'Add Task'}</h2>
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Task Title"
          className="w-full p-2 border mb-2 rounded"
        />
        <textarea
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          placeholder="Task Description"
          className="w-full p-2 border mb-2 rounded"
        />
        <button
          onClick={isEditing ? handleUpdateTask : handleAddTask}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <PlusCircle className="mr-2" />
          {isEditing ? 'Update Task' : 'Add Task'}
        </button>
      </div>

      {/* Task List */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
        <ul>
          {tasks.map((task) => (
            <li
              key={task.id}
              className="p-4 mb-4 border rounded shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className={`text-xl ${task.isCompleted ? 'line-through' : ''}`}>
                    {task.title}
                  </h3>
                  <p className={`${task.isCompleted ? 'line-through' : ''}`}>
                    {task.description}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleToggleTaskCompletion(task.id)}
                    className={`px-3 py-1 rounded ${
                      task.isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    } text-white`}
                  >
                    <CheckCircle />
                  </button>
                  <button
                    onClick={() => handleEditTask(task.id)}
                    className="px-3 py-1 bg-yellow-500 rounded text-white hover:bg-yellow-600"
                  >
                    <Edit />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="px-3 py-1 bg-red-600 rounded text-white hover:bg-red-700"
                  >
                    <Trash2 />
                  </button>
                </div>
              </div>

              {/* SubTasks Section */}
              <div className="ml-4">
                <h4 className="text-lg font-semibold mb-2">Subtasks</h4>
                <ul>
                  {task.subTasks.map((subTask) => (
                    <li key={subTask.id} className="flex items-center justify-between mb-2">
                      <div className={`flex-1 ${subTask.isCompleted ? 'line-through' : ''}`}>
                        {subTask.title}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleSubTaskCompletion(task.id, subTask.id)}
                          className={`px-3 py-1 rounded ${
                            subTask.isCompleted ? 'bg-green-500' : 'bg-gray-300'
                          } text-white`}
                        >
                          <CheckCircle />
                        </button>
                        <button
                          onClick={() => handleDeleteSubTask(task.id, subTask.id)}
                          className="px-3 py-1 bg-red-600 rounded text-white hover:bg-red-700"
                        >
                          <Trash2 />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Add SubTask */}
                <div className="flex items-center mt-2">
                  <input
                    type="text"
                    placeholder="Add subtask"
                    className="w-full p-2 border rounded mr-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
                        handleAddSubTask(task.id, e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const inputElement = document.querySelector<HTMLInputElement>(
                        `input[placeholder="Add subtask"]`
                      );
                      if (inputElement && inputElement.value.trim() !== '') {
                        handleAddSubTask(task.id, inputElement.value);
                        inputElement.value = '';
                      }
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <PlusCircle />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TaskPage;
