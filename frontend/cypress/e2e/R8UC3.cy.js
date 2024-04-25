describe('Logging into the system', () => {
    // define variables that we need on multiple occasions
    let uid // user id
    let name // name of the user (firstName + ' ' + lastName)
    let email // email of the user

    let taskId
    let taskRes = {
        title: "Test",
        description: "This is a test",
        url: "",
        userid: "",
        todos: ["Test"]
    }

    let todoRes = {
        "taskid": "",
        "description": "Done test todo",
        "done": false
    }

    before(function () {

        cy.fixture('user.json')
            .then((user) => {
                cy.request({
                    method: 'POST',
                    url: 'http://localhost:5000/users/create',
                    form: true,
                    body: user
                }).then((response) => {
                    uid = response.body._id.$oid
                    name = user.firstName + ' ' + user.lastName
                    email = user.email
                    taskRes.userid = uid
                    cy.writeFile('cypress/fixtures/task.json', (taskRes))
                })
            })

        cy.fixture("task.json")
            .then((task) => {
                let formData = new URLSearchParams();
                Object.entries(task).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                cy.request({
                    method: 'POST',
                    url: "http://localhost:5000/tasks/create",
                    form: true,
                    body: formData.toString()
                }).then((response) => {
                    taskId = response.body[0]._id.$oid
                    todoRes.taskid = taskId
                    cy.writeFile('cypress/fixtures/todo.json', (todoRes))
                })
            });

        // create a not done todo for the task
        cy.fixture('todo.json')
            .then((todo) => {
                let formData = new URLSearchParams();
                formData.append('taskid', todo.taskid);
                formData.append('description', todo.description);
                formData.append('done', true);
                cy.request({
                    method: 'POST',
                    url: 'http://localhost:5000/todos/create',
                    form: true,
                    body: formData.toString()
                }).then((response) => {
                    taskRes.todos.push(response.body._id.$oid)
                })
            });
    })

    beforeEach(function () {
        cy.visit('http://localhost:3000')
        cy.contains('div', 'Email Address')
            .find('input[type=text]')
            .type(email)

        cy.get('form')
            .submit()

        cy.get('h1')
            .should('contain.text', 'Your tasks, ' + name)

        cy.get('div.container-element')
            .find('a')
            .trigger('click')
    })

    it('3.1 Test that done task is undone when clicked', () => {
        let item = cy.get('.todo-item').find('.unchecked')
        item.click()
        item.should('have.class', 'checked')
    });

    it('2.2 Test that undone task is done when clicked', () => {
        let item = cy.get('.todo-item').eq(1)
        cy.get('.remover').eq(1).click()
        item.should('not.exist')
    });


    after(function () {
        // clean up by deleting the user from the database
        cy.request({
            method: 'DELETE',
            url: `http://localhost:5000/tasks/byid/${taskId}`
        }).then((response) => {
            cy.log(response.body)
        })
        cy.request({
            method: 'DELETE',
            url: `http://localhost:5000/users/${uid}`
        }).then((response) => {
            cy.log(response.body)
        })

    })
})