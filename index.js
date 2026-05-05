function createElement(tag, attributes, children, callbacks) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(key, attributes[key]);
    });
  }

  if (callbacks) {
    Object.keys(callbacks).forEach((event) => {
      element.addEventListener(event, callbacks[event]);
    });
  }

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });
  } else if (typeof children === "string") {
    element.appendChild(document.createTextNode(children));
  } else if (children instanceof HTMLElement) {
    element.appendChild(children);
  }

  return element;
}

class Component {
  constructor() {
  }

  getDomNode() {
    this._domNode = this.render();
    return this._domNode;
  }

  update() {
    const newNode = this.render();
    this._domNode.replaceWith(newNode);
    this._domNode = newNode;
  }

}

class AddTask extends Component {
  constructor(onAddTask) {
    super();
    this.onAddTask = onAddTask;
    this.state = {
      newTaskText: ""
    };
  }

  onInputChange = (e) => {
    this.state.newTaskText = e.target.value;
  }

  onButtonClick = () => {
    if (this.state.newTaskText.trim()) {
      this.onAddTask(this.state.newTaskText);
      this.state.newTaskText = "";
      this.update();
    }
  }

  render() {
    const input = createElement("input", {
      id: "new-todo",
      type: "text",
      placeholder: "Задание",
      value: this.state.newTaskText
    }, null, {
      input: this.onInputChange
    });
    const button = createElement("button", { id: "add-btn" }, "+", {
      click: this.onButtonClick
    });
    return [input, button];
  }
}

class Task extends Component {
  constructor(task, onToggle, onDelete) {
    super();
    this.task = task;
    this.onToggle = onToggle;
    this.onDelete = onDelete;
    this.state = {
      deleteClicked: false
    };
  }

  onDeleteClick = () => {
    if (this.state.deleteClicked) {
      this.onDelete(this.task.id);
    } else {
      this.state.deleteClicked = true;
      this.update();
    }
  }

  render() {
    const labelClass = this.task.completed ? "completed" : "";
    const buttonClass = this.state.deleteClicked ? "delete-confirm" : "";
    const checkbox = createElement("input", { 
      type: "checkbox"
    }, null, {
      change: () => this.onToggle(this.task.id)
    });
    if (this.task.completed) {
      checkbox.checked = true;
    }
    return createElement("li", {}, [
      createElement("label", { class: labelClass }, [
        checkbox,
        this.task.text
      ]),
      createElement("button", { class: buttonClass }, "🗑️", {
        click: this.onDeleteClick
      })
    ]);
  }
}

class TodoList extends Component {
  constructor(tasks) {
    super();
    if (!tasks) {
      tasks = [
        { id: 1, text: "Сделать домашку", completed: false },
        { id: 2, text: "Сделать практику", completed: false },
        { id: 3, text: "Пойти домой", completed: false }
      ]
    }
    console.log(tasks)
    this.state = {
      tasks: tasks,
      nextId: tasks.length + 1,
    };
  }

  onAddTask = (text) => {
    this.state.tasks.push({
      id: this.state.nextId++,
      text: text,
      completed: false
    });
    this.update();
    localStorage.setItem("todoList", JSON.stringify(this.state.tasks));
  }

  onToggleTask = (id) => {
    const task = this.state.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.update();
    }
  }

  onDeleteTask = (id) => {
    this.state.tasks = this.state.tasks.filter(t => t.id !== id);
    this.update();
    localStorage.setItem("todoList", JSON.stringify(this.state.tasks));
  }

  render() {
    const addTaskComponent = new AddTask(this.onAddTask);
    const addTaskElements = addTaskComponent.getDomNode();
    const taskComponents = this.state.tasks.map(task => 
      new Task(task, this.onToggleTask, this.onDeleteTask).getDomNode()
    );

    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      createElement("div", { class: "add-todo" }, addTaskElements),
      createElement("ul", { id: "todos" }, taskComponents),
    ]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let todoList = new TodoList(JSON.parse(localStorage.getItem('todoList')));
  document.body.appendChild(todoList.getDomNode());
});
