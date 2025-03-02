import {isToday, isThisWeek, compareAsc} from "date-fns";

let projects;
let todos;

export const Priority = {
    LOW: 4,
    MED: 3,
    HIGH: 2,
    URGENT: 1
};

function createTodoItem(title, description, dueDate, priority, projectId) {
    return {title, description, dueDate, priority, projectId, id: todos.length};
}

function createProject(title) {
    return {title, id: projects.length};
}

function compareFunc(t1, t2) {
    return compareAsc(t1.dueDate, t2.dueDate);
}

function updateLocalStorage() {
    localStorage.projects = JSON.stringify(projects);
    localStorage.todos = JSON.stringify(todos);
}

export function load() {
    try {
        projects = JSON.parse(localStorage.projects)
            .filter((project) => project !== null)
            .map((project, ind) => {
                return {
                    title: project.title,
                    id: ind
                };
            });
        todos = JSON.parse(localStorage.todos)
            .filter((todo) => todo !== null)
            .map((todo, ind) => {
                return {
                    title: todo.title,
                    description: todo.description,
                    dueDate: new Date(todo.dueDate),
                    priority: todo.priority,
                    projectId: todo.projectId,
                    id: ind
                };
            });
        console.log(projects);
        console.log(todos);
    }
    catch (error) {
        console.warn("Unabled to load local storage");
        console.warn(error);
        projects = [];
        todos = [];
        projects.push(createProject("Default"));
    }
}

export function getDefaultProject() {
    return projects[0];
};

export function addProject(title) {
    projects.push(createProject(title));
    updateLocalStorage();
}

export function addTodo(title, description, dueDate, priority, projectId) {
    todos.push(createTodoItem(title, description, dueDate, priority, projectId));
    updateLocalStorage();
}

export function removeTodo(todoId) {
    const removed = todos[todoId];
    delete todos[todoId];
    updateLocalStorage();
    return removed;
}

export function removeProject(projectId) {
    const removed = projects[projectId];
    delete projects[projectId];
    updateLocalStorage();
    return removed;
}

export function updateProject(projectId, updates) {
    const project = projects[projectId];
    if (!project) {
        return null;
    }
    const updated = {...project, ...updates};
    projects[projectId] = updated;
    updateLocalStorage();
    return updated;
}

export function updateTodo(todoId, updates) {
    const todo = todos[todoId];
    if (!todo) {
        return null;
    }
    const updated = {...todo, ...updates};
    todos[todoId] = updated;
    updateLocalStorage();
    return updated;
}

export function getTodo(todoId) {
    return todos[todoId];
}

export function getProject(projectId) {
    return projects[projectId];
}

export function getAllTodos() {
    // Dumb code
    return todos.slice().sort(compareFunc);
}

export function getAllProjects() {
    return projects.slice();
}

export function getTodosToday() {
    return todos.filter((todo) => isToday(todo.dueDate)).sort(compareFunc);
}

export function getTodosWeek() {
    return todos.filter((todo) => isThisWeek(todo.dueDate)).sort(compareFunc);
}

export function getAllTodosFromProject(projectId) {
    return todos.filter((todo) => todo.projectId === projectId).sort(compareFunc);
}


