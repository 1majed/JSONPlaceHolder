import http from "k6/http";
import { check } from "k6";
import { SharedArray } from "k6/data";

// This test is to make sure all the invalid options for todos endpoint are rejected

//invalid_GET_data
const invalid_GET_data = new SharedArray("InvalidGetValues", function () {
    return JSON.parse(open('./invalid-data-todo.json')).invalid_GET_data;
});

//invalid_POST_data
const invalid_POST_data = new SharedArray("InvalidPostValues", function () {
    return JSON.parse(open('./invalid-data-todo.json')).invalid_POST_data;
});

//invalid_PUT_data
const invalid_PUT_data = new SharedArray("InvalidPutValues", function () {
    return JSON.parse(open('./invalid-data-todo.json')).invalid_PUT_data;
});

export default function () {

    // Parameters for POST,PUT..
    const params = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    };
    
    //-----------

    //Verify invalid GET entries
    invalid_GET_data.forEach((item) => {
        console.log(`Running GET(https://jsonplaceholder.typicode.com/todos/${item.value}`);
        let re_todos = http.get(`https://jsonplaceholder.typicode.com/todos/${item.value}`);
        check(re_todos, { 'todos (GET) endpoint status is 404': (r) => r.status === 404 });
    })

    //-----------

    //Verify invalid POST entries -- *** Defect, the API is accepting all invalid options

    invalid_POST_data.forEach((item) => {
        //Create new todo
        let new_todo = {
            "userId": 1,
            "id": 1,
            "title": "simple task",
            "completed": false
        };
        console.log(`Here is the initial todo`);
        console.log(new_todo);

        new_todo[item.field] = item.value;
        console.log(`I put the value ${item.value} into the field ${item.field}`);
        console.log(`Here is the new todo`);
        console.log(new_todo);
        let stringified_new_todo = JSON.stringify(new_todo);

        let pos_todos = http.post('https://jsonplaceholder.typicode.com/todos', stringified_new_todo, params);
        check(pos_todos, { 'todo creation (POST) end point status is 422': (r) => r.status === 422 });
        console.log(`Running POST(https://jsonplaceholder.typicode.com/todos/$/ with field:${item.field} is set to: ${item.value} `);
    })

    //-----------

    // To be able to modify an existing Todo, we need to create one:
    let new_todo = JSON.stringify({
        "userId": 1,
        "id": 1,
        "title": "simple task",
        "completed": false
    });
    //Send a POST todo request
    console.log('Adding a todo (POST) with the title simple task');
    let pos_todos = http.post('https://jsonplaceholder.typicode.com/todos', new_todo, params);
    check(pos_todos, { 'todo creation (POST) end point status is 201': (r) => r.status === 201 });
    console.log(`Running POST(https://jsonplaceholder.typicode.com/todos/ expected status= 201 actual status=${pos_todos.status}`);
    let new_todo_id = pos_todos.json().id;
    console.log('the returned new todo ID:' + new_todo_id);

    //-----------

    //try to send a duplicate POST todo request
    console.log('Adding a duplicate todo (POST) with the title simple task');
    let dup_pos_todos = http.post('https://jsonplaceholder.typicode.com/todos', new_todo, params);
    check(dup_pos_todos, { 'todo creation (POST) end point status is 400': (r) => r.status === 400 });
    console.log(`Running POST(https://jsonplaceholder.typicode.com/todos expected status= 400 actual status=${dup_pos_todos.status}`);
    let dup_new_todo_id = pos_todos.json().id;
    console.log('the returned duplicate todo ID:' + dup_new_todo_id);

    //-----------
    
    //Verify invalid PUT entries  ---- *** Defect, API is accepting all values
    invalid_PUT_data.forEach((item) => {
        //Create new todo
        let new_todo = {
            "userId": 1,
            "id": 1,
            "title": "simple task",
            "completed": false
        };
        console.log(`Here is the initial todo`);
        console.log(new_todo);

        new_todo[item.field] = item.value;
        console.log(`I put the value ${item.value} into the field ${item.field}`);
        console.log(`Here is the new todo`);
        console.log(new_todo);
        let stringified_new_todo = JSON.stringify(new_todo);

        let pos_todos = http.put(`https://jsonplaceholder.typicode.com/todos/${new_todo_id}`, stringified_new_todo, params);
        check(pos_todos, { 'todo creation (PUT) end point status is 422': (r) => r.status === 422 });
        console.log(`Running PUT(https://jsonplaceholder.typicode.com/todos/${new_todo_id}/ with field:${item.field} is set to: ${item.value} `);
    })

    //-----------

        //Verify invalid delete entry  ---- *** Defect, API is returning success when it is not deleting and it shouldn't be 
        pos_todos = http.del(`https://jsonplaceholder.typicode.com/todos/${new_todo_id+33}`, params);
        check(pos_todos, { 'todo deletion (del) end point status is 404': (r) => r.status === 404 });
        console.log(`Running DELETE-del(https://jsonplaceholder.typicode.com/todos/${new_todo_id+33}/`);
}