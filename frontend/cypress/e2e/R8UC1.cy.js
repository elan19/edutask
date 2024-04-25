describe('Logging into the system', () => {
    // define variables that we need on multiple occasions
    let uid // user id
    let name // name of the user (firstName + ' ' + lastName)
    let email // email of the user

    let taskId
    let taskRes = {
        title: "test",
        description: "This is a test",
        url: "",
        userid: "",
        todos: ["Watch video"]
    }

    before(function () {
        // create a fabricated user from a fixture
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

    it('1.1 Test add a todo item and check that its there', () => {
        cy.get('.inline-form').find('input[type=text]').type("Test todo")
        cy.get('.inline-form').find('input[type=submit]').click()
        cy.get('.todo-list').find('li').should('contain.text', 'Test todo')
    });

    it('1.2 Test button disabled when there is no text in input field', () => {
        cy.get('.inline-form').find('input[type=submit]').should('be.disabled')
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