import http from "k6/http";
import { check } from "k6";
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';


// This test is to make sure all the happy path for todos endpoint are successful

export default function () {

    //Create random title
    let title = randomString(6) + " " + randomString(5);
    //Create random title2
    let title2 = randomString(6) + " " + randomString(5);

    //Create new todo
    const new_todo = JSON.stringify({
        "userId": 1,
        "id": 1,
        "title": title,
        "completed": false
    });
    //Update the new user info

    const updated_todo_title2 = JSON.stringify({
        "userId": 1,
        "id": 1,
        "title": title2,
        "completed": false
    });

    const params = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    };

    //Send todo request
    console.log('Adding a todo (POST) with the title ' + title);
    let pos_todos = http.post('https://jsonplaceholder.typicode.com/todos', new_todo, params);
    check(pos_todos, { 'todo creation (POST) end point status is 201': (r) => r.status === 201 });
    console.log(`Running POST(https://jsonplaceholder.typicode.com/todos/ expected status= 201 actual status=${pos_todos.status}`);
    let new_todo_id = pos_todos.json().id;
    console.log('the returned new todo ID:' + new_todo_id);

    //GET all entries
    let re_todos = http.get('https://jsonplaceholder.typicode.com/todos');
    check(re_todos, { 'todos (GET) endpoint status is 200': (r) => r.status === 200 });

    //See if the last todo created is added to the todos
    // --- Test Failed The POST did not work as expected 
    console.log('getting back (GET) an todo with the title ' + title);
    check(re_todos, { 'Verifying if new title is added to todos:': (r) => r.body.includes(title) === true }); // this todo does not exist--defect

    //PUT to update the todo title - Put filed because the new todo title was not added
    console.log('updating (PUT) the newly created todo with the todo second title ' + title2);
    let put_todo = http.put('https://jsonplaceholder.typicode.com/todos', updated_todo_title2, params);
    check(put_todo, { 'todos (PUT) update end point status is 200': (r) => r.status === 200 });
    console.log(`Running PUT(https://jsonplaceholder.typicode.com/todos/ expected status= 200 actual status=${put_todo.status}`);
    let new_todo_updated_title2 = put_todo.json().title2;
    console.log('the returned title2:' + new_todo_updated_title2);

    //GET all entries
    re_todos = http.get('https://jsonplaceholder.typicode.com/todos');
    check(re_todos, { 'get (GET) todos end point status is 200': (r) => r.status === 200 });

    //See if the title2 of the last todo created is updated
    // --- Test Failed The todo did not work as expected 
    console.log('getting (GET) back a todos with the second title ' + new_todo_updated_title2);
    check(re_todos, { 'Verifying (GET) if the second title is updated ': (r) => r.body.includes(new_todo_updated_title2) === true }); // this todo does not exist--defect

    //DELETE the last created entry (with the ID: new_todo_id)
    //new_todo --- Defect action is passing even when it is not deleting
    console.log('deleting (DELETE) the todo with the id ' + new_todo_id);
    let del_todo = http.del(`https://jsonplaceholder.typicode.com/todos/${new_todo_id}`, new_todo, params);
    check(del_todo, { 'todo deletion (DELETE) request status is 200': (r) => r.status === 200 });
    console.log(`Running DELTE(https://jsonplaceholder.typicode.com/todos/${new_todo_id} expected status= 200 actual status=${del_todo.status}`);
    console.log('Even when it says it did, todos endpoint is not deleting the todo with the id ' + new_todo_id);
}