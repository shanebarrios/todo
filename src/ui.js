import * as todoManager from "./todo-manager.js";
import {isPast, isToday, isTomorrow, startOfDay, isThisWeek, format, parseISO} from "date-fns";

const allTasksButton = document.querySelector("#all-tasks");
const todayButton = document.querySelector("#today");
const weekButton = document.querySelector("#week");

const addProjectButton = document.querySelector(".add-project");
const addProjectForm = document.querySelector(".add-project-form");
const addProjectCancel = document.querySelector("#add-project-cancel");

const addTodoButton = document.querySelector(".add-todo");
const addTodoForm = document.querySelector(".todo-form");
const addTodoCancel = document.querySelector("#add-todo-cancel");

const tabContainer = document.querySelector(".tab-container");
const tabTitle = document.querySelector("h2");
const todosContainer = document.querySelector(".todos-container");

const projectNav = document.querySelector(".project-nav");

const todoTemplate = document.querySelector("#todo-entry-template");
const navTemplate = document.querySelector("#project-nav-template");

const currentTab = {
    type: "all",
    id: 0
};


function formatDate(date) {
    if (isToday(date)) {
        return "Today";
    }
    else if (isPast(date)) {
        return "Overdue";
    }
    else if (isTomorrow(date)) {
        return "Tomorrow";
    }
    else if (isThisWeek(date)) {
        return format(date, "EEEE");
    }
    else {
        return format(date, "MMM d")
    }
}

export function displayTab() {
    let todos;
    let title;
    if (currentTab.type === "all") {
        todos = todoManager.getAllTodos();
        title = "All Tasks";
    }
    else if (currentTab.type === "day") {
        todos = todoManager.getTodosToday();
        title = "Today";
    }
    else if (currentTab.type === "week") {
        todos = todoManager.getTodosWeek();
        title = "Week";
    }
    else {
        todos = todoManager.getAllTodosFromProject(currentTab.id);
        const proj = todoManager.getProject(currentTab.id)
        if (!proj) {
            console.log(`Could not find proj at index ${currentTab.id}`)
            console.log(currentTab.type);
            console.log(todoManager.getAllProjects());
            return
        }
        title = proj.title;
    }
    tabTitle.textContent = title;
    addTodoForm.reset();
    addTodoForm.style.display = "none";
    todosContainer.innerHTML = "";
    todos.forEach((todo) => todosContainer.appendChild(createTodoEntry(todo, todo.id)));
}

function createTodoEntry(todo) {
    const todoEntry = todoTemplate.content.cloneNode(true).querySelector(".todo-entry");
    todoEntry.id = todo.id + "todo";
    todoEntry.querySelector(".todo-name").textContent = todo.title;
    const checkmark = todoEntry.querySelector(".checkmark");
    checkmark.classList.add(`priority${todo.priority}`);
    todoEntry.querySelector(".due-date").textContent = formatDate(todo.dueDate);
    return todoEntry;
}

export function displayNav() {
    projectNav.innerHTML = "";
    todoManager.getAllProjects().slice(1).forEach((project) => {
        projectNav.appendChild(createNavEntry(project));
    });
}

function createNavEntry(project) {
    const navEntry = navTemplate.content.cloneNode(true).querySelector("li");
    navEntry.id = project.id + "project";
    navEntry.querySelector(".category").textContent = project.title;
    navEntry.addEventListener("click", (e) => {
        currentTab.type = "project";
        currentTab.id = parseInt(e.currentTarget.id, 10);
        displayTab();
    });
    return navEntry;
}

function placeForm(todoEntry) {
    setDefaultFormContents();
    if (!todoEntry) {
        setAddFormContents();
        tabContainer.insertBefore(addTodoForm, todosContainer);
    }
    else {
        setUpdateFormContents(parseInt(todoEntry.id, 10));
        todosContainer.insertBefore(addTodoForm, todoEntry);
        todosContainer.removeChild(todoEntry);
    }
    addTodoButton.style.display = "none";
    addTodoForm.style.display = "flex";
    document.addEventListener("mousedown", clickOutsideCallback);
}

function clickOutsideCallback(e) {
    console.log(e.target);
    if (e.target !== addTodoForm && !addTodoForm.contains(e.target) && 
    e.target !== addTodoButton && !addTodoButton.contains(e.target)) {
        hideForm();
        document.removeEventListener("mousedown", clickOutsideCallback);
    }
}

function hideForm() {
    addTodoForm.style.display = "none";
    addTodoForm.reset();
    document.removeEventListener("mousedown", clickOutsideCallback);
    addTodoButton.style.display = "flex";
    displayTab();
}

function setUpdateFormContents(id) {
    const todo = todoManager.getTodo(id);
    addTodoForm.querySelector("#title-input").value = todo.title;
    addTodoForm.querySelector("#description-input").value = todo.description;
    addTodoForm.querySelector("#due-date-input").valueAsDate = todo.dueDate;
    addTodoForm.querySelector("#priority-input").value = String(todo.priority);
    addTodoForm.querySelector("#project-input").value = String(todo.projectId);
    addTodoForm.querySelector("#add-todo-submit").textContent = "Update";
    addTodoForm.id = String(id) + "updating";
}

function setAddFormContents() {
    const curDate = format(new Date(), "yyyy-MM-dd");
    addTodoForm.querySelector("#due-date-input").value = curDate;
    addTodoForm.querySelector("#add-todo-submit").textContent = "Add";
    addTodoForm.id = "adding";
}


function setDefaultFormContents() {
    const curDate = format(new Date(), "yyyy-MM-dd");
    addTodoForm.querySelector("#due-date-input").setAttribute("min", curDate);
    const select = addTodoForm.querySelector("#project-input");
    select.innerHTML = "";
    todoManager.getAllProjects().forEach((project, id) => {
        const option = new Option(`\u{1F4C1} ${project.title}`, id);
        if (currentTab.type === "project" && currentTab.id === id) {
            option.setAttribute("selected", "");
        } 
        select.add(option);
    });
}


allTasksButton.addEventListener("click", () => {
    currentTab.type = "all";
    displayTab();
});

todayButton.addEventListener("click", () => {
    currentTab.type = "day";
    displayTab();
});

weekButton.addEventListener("click", () => {
    currentTab.type = "week";
    displayTab();
});

addProjectButton.addEventListener("click", () => {
    addProjectButton.style.display = "none";
    addProjectForm.style.display = "block";
    addProjectForm.querySelector("input").focus();
});

addProjectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = addProjectForm.elements["title-input"].value;
    todoManager.addProject(title);
    addProjectForm.style.display = "none";
    addProjectButton.style.display = "flex";
    addProjectForm.reset();
    displayNav();
})

addProjectCancel.addEventListener("click", (e) => {
    e.preventDefault();
    addProjectForm.style.display = "none";
    addProjectButton.style.display = "flex";
    addProjectForm.reset();
})

addTodoButton.addEventListener("click", () => {
    placeForm(null);
});

addTodoCancel.addEventListener("click", (e) => {
    e.preventDefault();
    hideForm();
});

addTodoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formElements = addTodoForm.elements;
    const todo = {
        title: formElements["title-input"].value, 
        description: formElements["description-input"].value,
        dueDate: startOfDay(parseISO(formElements["due-date-input"].value)),
        priority: Number(formElements["priority-input"].value),
        projectId: Number(formElements["project-input"].value)
    };
    if (addTodoForm.id === "adding") {
        todoManager.addTodo(todo.title, todo.description, todo.dueDate, todo.priority, todo.projectId);
    }
    else {
        todoManager.updateTodo(parseInt(addTodoForm.id, 10), todo);
    }
    hideForm(); // necessary to call this one first to disable action listeners
    displayTab();
    addTodoForm.reset();
});


todosContainer.addEventListener("click", (e) => {
    console.log("yay");
    const todo = e.target.closest(".todo-entry");
    const checkmark = e.target.closest(".checkmark");
    if (checkmark) {
        const id = parseInt(todo.id, 10);
        todoManager.removeTodo(id);
        displayTab();
    }
    else if (todo) {
        placeForm(todo);
    }
});

todosContainer.addEventListener("mouseover", (e) => {
    const todo = e.target.closest(".todo-entry");
    const checkmark = e.target.closest(".checkmark");
    if (checkmark) {
        checkmark.textContent = "\u2714";
    }
    else if (todo) {
        todo.querySelector(".active-img").style.display = "inline";
    }  
});

todosContainer.addEventListener("mouseout", (e) => {
    const todo = e.target.closest(".todo-entry");
    const checkmark = e.target.closest(".checkmark");
    if (checkmark) {
        checkmark.textContent = "";
    }
    else if (todo) {
        todo.querySelector(".active-img").style.display = "none";
    }
});
