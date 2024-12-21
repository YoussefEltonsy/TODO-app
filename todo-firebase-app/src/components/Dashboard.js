import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  orderBy 
} from 'firebase/firestore';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import '../styles/Dashboard.css';
import ProfileMenu from './ProfileMenu';

// Styled components
const StyledAppBar = styled(AppBar)`
  &.MuiAppBar-root {
    background-color: var(--primary-color);
  }
`;

const StyledTab = styled(Tab)`
  &.MuiTab-root {
    color: rgba(255, 255, 255, 0.7);
    font-weight: bold;
    text-transform: uppercase;
  }
  &.Mui-selected {
    color: white;
  }
`;

function Dashboard() {
  const [newTodo, setNewTodo] = useState('');
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch todos on component mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // Fetch todos from Firestore
  const fetchTodos = async () => {
    try {
      const todosRef = collection(db, `users/${currentUser.uid}/todos`);
      const q = query(todosRef, orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const todosList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTodos(todosList);
    } catch (error) {
      setError('Failed to fetch todos');
    }
  };

  // Add new todo
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const todosRef = collection(db, `users/${currentUser.uid}/todos`);
      await addDoc(todosRef, {
        text: newTodo,
        completed: false,
        timestamp: new Date().toISOString()
      });
      setNewTodo('');
      fetchTodos();
    } catch (error) {
      setError('Failed to add todo');
    }
  };

  // Toggle todo completion
  const toggleTodo = async (todoId, completed) => {
    try {
      const todoRef = doc(db, `users/${currentUser.uid}/todos`, todoId);
      await updateDoc(todoRef, {
        completed: !completed
      });
      fetchTodos();
    } catch (error) {
      setError('Failed to update todo');
    }
  };

  // Delete todo
  const deleteTodo = async (todoId) => {
    try {
      const todoRef = doc(db, `users/${currentUser.uid}/todos`, todoId);
      await deleteDoc(todoRef);
      fetchTodos();
    } catch (error) {
      setError('Failed to delete todo');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to log out');
    }
  };

  // Filter todos based on active tab
  const filteredTodos = todos.filter(todo => {
    if (tab === 0) return true; // All todos
    if (tab === 1) return !todo.completed; // Active todos
    return todo.completed; // Completed todos
  });

  return (
    <>
      <StyledAppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Todo App
          </Typography>
          <ProfileMenu />
        </Toolbar>
      </StyledAppBar>

      <Container className="dashboard-container">
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Paper elevation={3} className="todo-form">
          <Box component="form" onSubmit={handleAddTodo}>
            <TextField
              fullWidth
              label="New Todo"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              sx={{ mb: 2 }}
              className="todo-input"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="add-button"
            >
              Add Todo
            </Button>
          </Box>
        </Paper>

        <Paper elevation={3} className="todo-list">
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            variant="fullWidth"
            className="tab-bar"
          >
            <StyledTab label="All" />
            <StyledTab label="Active" />
            <StyledTab label="Completed" />
          </Tabs>

          <List>
            {filteredTodos.map((todo) => (
              <ListItem key={todo.id} className="todo-item">
                <Checkbox
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                />
                <ListItemText
                  primary={todo.text}
                  className={`todo-text ${todo.completed ? 'completed' : ''}`}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => deleteTodo(todo.id)}
                    className="delete-button"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>
    </>
  );
}

export default Dashboard;

