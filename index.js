window.addEventListener('load', () => {
    const form = document.querySelector("#new-task-form");
    const input = document.querySelector("#new-task-input");
    const list_el = document.querySelector("#tasks");
    const modal = document.getElementById("todoModal");
    const modalTitle = document.getElementById("modal-task-title");
    const modalBody = document.getElementById("modal-task-body");
    const saveBtn = document.getElementById("save-todo");
    const closeModal = document.querySelector(".close");
    let currentTodoId = null;

    // Modal open logic
    const openModal = (title, body, id) => {
        currentTodoId = id;
        modalTitle.value = title;
        modalBody.value = body;
        modal.style.display = "block"; // Show modal
    };

    // Close modal on 'X' click
    closeModal.onclick = function() {
        modal.style.display = "none";
    };

    // Close modal on clicking outside
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    // Save task via modal
    saveBtn.onclick = async () => {
        const updatedTitle = modalTitle.value;
        const updatedBody = modalBody.value;
        await updateTask(currentTodoId, updatedTitle, updatedBody); // Save changes to the API
        modal.style.display = "none"; // Hide modal
    };

    // Fetch existing todos from the API
    const loadTasks = async () => {
        list_el.innerHTML = ''; // Clear the list first
        try {
            const response = await fetch('http://localhost/phpRest/api/read.php', {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const todos = await response.json();
            todos.forEach((todo) => {
                createTaskElement(todo.todo_title, todo.todo_body, todo.todo_id);
            });
        } catch (error) {
            console.error('Fetch error:', error);  // Log errors if any
        }
    };

    // Create task element and append it to the task list
    const createTaskElement = (title, body, id) => {
        const task_el = document.createElement('div');
        task_el.classList.add('task');

        const task_content_el = document.createElement('div');
        task_content_el.classList.add('content');

        task_el.appendChild(task_content_el);

        const task_input_el = document.createElement('input');
        task_input_el.classList.add('text');
        task_input_el.type = 'text';
        task_input_el.value = title;
        task_input_el.setAttribute('readonly', 'readonly');

        task_content_el.appendChild(task_input_el);

        const task_actions_el = document.createElement('div');
        task_actions_el.classList.add('actions');

        const task_edit_el = document.createElement('button');
        task_edit_el.classList.add('edit');
        task_edit_el.innerText = 'Edit';

        const task_delete_el = document.createElement('button');
        task_delete_el.classList.add('delete');
        task_delete_el.innerText = 'Delete';

        task_actions_el.appendChild(task_edit_el);
        task_actions_el.appendChild(task_delete_el);

        task_el.appendChild(task_actions_el);

        list_el.appendChild(task_el);

        // Edit task
        task_edit_el.addEventListener('click', () => {
            openModal(title, body, id);
        });

        // Delete task
        task_delete_el.addEventListener('click', async () => {
            await deleteTask(id); // delete via API
            list_el.removeChild(task_el); // Remove element from DOM
        });
    };

    // Add a new task via the form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (input.value === "") {
            alert("Todo must not be blank");
            return;
        }

        const task = input.value;
        const todoBody = document.getElementById("txtArea").value;
        input.value = ''; // clear input field

        await addTask(task, todoBody);
        loadTasks(); // Reload tasks
    });

    // Add task to the database via API
    const addTask = async (title, body) => {
        await fetch('http://localhost/phpRest/api/create.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ todo_title: title, todo_body: body })
        });
    };

    // Update task in the database via API
    const updateTask = async (id, title, body) => {
        await fetch('http://localhost/phpRest/api/update.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ todo_id: id, todo_title: title, todo_body: body })
        });
        loadTasks();
    };

    // Delete task from the database via API
    const deleteTask = async (id) => {
        await fetch('http://localhost/phpRest/api/delete.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ todo_id: id })
        });
    };

    // Load existing tasks on page load
    loadTasks();
});
