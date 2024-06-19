import http from "k6/http";
import { check } from "k6";
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';



// This test is to make sure all the happy paths for all the calls with the users endpoint are successful

export default function () {

    //Create random name
    let user_name = randomString(6) + " " + randomString(5);

    //Create a random email
    let email = randomString(6) + "@" + randomString(5) + "." + randomString(3);

    //Create new user info
    const new_user_body = JSON.stringify({
        "id": 1,
        "name": user_name,
        "username": "Bret",
        "email": "Sincere@april.biz",
        "address": {
            "street": "Kulas Light",
            "suite": "Apt. 556",
            "city": "Gwenborough",
            "zipcode": "92998-3874",
            "geo": {
                "lat": "-37.3159",
                "lng": "81.1496"
            }
        },
        "phone": "1-770-736-8031 x56442",
        "website": "hildegard.org",
        "company": {
            "name": "Romaguera-Crona",
            "catchPhrase": "Multi-layered client-server neural-net",
            "bs": "harness real-time e-markets"
        }
    });

    //Update the new user info
    const updated_user_body = JSON.stringify({
        "id": 1,
        "name": user_name,
        "username": "Bret",
        "email": email,
        "address": {
            "street": "Kulas Light",
            "suite": "Apt. 556",
            "city": "Gwenborough",
            "zipcode": "92998-3874",
            "geo": {
                "lat": "-37.3159",
                "lng": "81.1496"
            }
        },
        "phone": "1-770-736-8031 x56442",
        "website": "hildegard.org",
        "company": {
            "name": "Romaguera-Crona",
            "catchPhrase": "Multi-layered client-server neural-net",
            "bs": "harness real-time e-markets"
        }
    });

    const params = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    };

    //Verify POST request
    console.log('Adding a user with the name ' + user_name);
    let pos_user = http.post('https://jsonplaceholder.typicode.com/users', new_user_body, params);
    check(pos_user, { 'user creation end point status is 201': (r) => r.status === 201 });
    console.log(`Running POST(https://jsonplaceholder.typicode.com/users/ expected status= 201 actual status=${pos_user.status}`);
    let new_user_id = pos_user.json().id;
    console.log('the returned ID:' + new_user_id);

    //GET all entries
    let re_users = http.get('https://jsonplaceholder.typicode.com/users');
    check(re_users, { 'users end point status is 200': (r) => r.status === 200 });

    //See if the last user created is added to the users
    // --- Test Failed The POST did not work as expected 
    console.log('getting back a user with the name ' + user_name);
    check(re_users, { 'Verifying if new username is added to users:': (r) => r.body.includes(user_name) === true }); // this user does not exist--defect

    //PUT to update the email - PUT filed because the new user was not added
    console.log('updating the newly created user with the email ' + email);
    let put_user = http.put('https://jsonplaceholder.typicode.com/users', updated_user_body, params);
    check(put_user, { 'user update end point status is 200': (r) => r.status === 200 });
    console.log(`Running PUT(https://jsonplaceholder.typicode.com/users/ expected status= 200 actual status=${put_user.status}`);
    let new_user_updated_email = pos_user.json().email;
    console.log('the returned email:' + new_user_updated_email);

    //GET all entries
    re_users = http.get('https://jsonplaceholder.typicode.com/users');
    check(re_users, { 'users end point status is 200': (r) => r.status === 200 });

    //See if the email of the last user created is updated
    // --- Test Failed The POST did not work as expected 
    console.log('getting back a user with the name ' + user_name);
    check(re_users, { 'Verifying if the email is updated ': (r) => r.body.includes(email) === true }); // this user does not exist--defect

    //DELETE the last created entry (with the ID: new_user_id)
    //new_user_body --- Defect action is passing even when it is not deleting
    console.log('deleting the user with the id ' + new_user_id);
    let del_user = http.del(`https://jsonplaceholder.typicode.com/users/${new_user_id}`, new_user_body, params);
    console.log(`Running DELTE(https://jsonplaceholder.typicode.com/users/${new_user_id} expected status= 200 actual status=${del_user.status}`);
    check(del_user, { 'user deletion request status is 200': (r) => r.status === 200 });
}