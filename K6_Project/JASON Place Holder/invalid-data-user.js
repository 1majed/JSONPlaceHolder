import http from "k6/http";
import { check } from "k6";
import { SharedArray } from "k6/data";

// This test is to make sure all the invalid options for users endpoint are rejected

//invalid_GET_data
const invalid_GET_data = new SharedArray("InvaliduserGetValues", function () {
    return JSON.parse(open('./invalid-data-user.json')).invalid_GET_data;
});

//invalid_POST_data
const invalid_POST_data = new SharedArray("InvaliduserPostValues", function () {
    return JSON.parse(open('./invalid-data-user.json')).invalid_POST_data;
});

//invalid_PUT_data
const invalid_PUT_data = new SharedArray("InvaliduserPutValues", function () {
    return JSON.parse(open('./invalid-data-user.json')).invalid_PUT_data;
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
        
        let re_users = http.get(`https://jsonplaceholder.typicode.com/users/${item.value}`);
        check(re_users, { 'users (GET) endpoint status is 404': (r) => r.status === 404 });
        console.log(`Running GET(https://jsonplaceholder.typicode.com/users/${item.value} expected status= 404 actual status=${re_users.status}`);
    })

    //-----------

    //Verify invalid POST entries -- *** Defect, the API is accepting all invalid options

    invalid_POST_data.forEach((item) => {
        //Create new user
        let new_user = {
            "id": 1,
            "name": "newLeanne Graham",
            "username": "newBret",
            "email": "newSincere@april.biz",
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
          };
        console.log(`Here is the initial user`);
        console.log(new_user);

        new_user[item.field] = item.value;
        console.log(`I put the value ${item.value} into the field ${item.field}`);
        console.log(`Here is the new user`);
        console.log(new_user);
        let stringified_new_user = JSON.stringify(new_user);

        let pos_users = http.post('https://jsonplaceholder.typicode.com/users', stringified_new_user, params);
        check(pos_users, { 'user creation (POST) end point status is 422': (r) => r.status === 422 });
        console.log(`Running POST(https://jsonplaceholder.typicode.com/users/$/ with field:${item.field} is set to: ${item.value} expected status= 422 actual status=${pos_users.status}`);
    })

    //-----------

    // To be able to modify an existing user, we need to create one:
    let new_user = JSON.stringify({
        "id": 1,
        "name": "newLeanne Graham",
        "username": "newBret",
        "email": "newSincere@april.biz",
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
    //Send a POST user request
    console.log('Adding a user (POST) with the title simple task');
    let pos_users = http.post('https://jsonplaceholder.typicode.com/users', new_user, params);
    check(pos_users, { 'user creation (POST) end point status is 201': (r) => r.status === 201 });
    console.log(`Running POST(https://jsonplaceholder.typicode.com/todos/ expected status= 201 actual status=${pos_users.status}`);
    let new_user_id = pos_users.json().id;
    console.log('the returned new user ID:' + new_user_id);

    //-----------

     //try to send a duplicate POST user request
     console.log('Adding a duplicate user (POST) with the title simple task');
     let dup_pos_users = http.post('https://jsonplaceholder.typicode.com/users', new_user, params);
     check(dup_pos_users, { 'user creation (POST) end point status is 400': (r) => r.status === 400 });
     console.log(`Running POST(https://jsonplaceholder.typicode.com/todos/ expected status= 400 actual status=${dup_pos_users.status}`);
     let dup_new_user_id = dup_pos_users.json().id;
     console.log('the returned duplicate user ID:' + dup_new_user_id);
 
     //-----------

    //Verify invalid PUT entries  ---- *** Defect, API is accepting all values
    invalid_PUT_data.forEach((item) => {
        //Create new user
        let new_user = {
            "id": 1,
            "name": "newLeanne Graham",
            "username": "newBret",
            "email": "newSincere@april.biz",
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
          };
        console.log(`Here is the initial user`);
        console.log(new_user);

        new_user[item.field] = item.value;
        console.log(`I put the value ${item.value} into the field ${item.field}`);
        console.log(`Here is the new user`);
        console.log(new_user);
        let stringified_new_user = JSON.stringify(new_user);

        let pos_users = http.put(`https://jsonplaceholder.typicode.com/users/${new_user_id}`, stringified_new_user, params);
        check(pos_users, { 'user creation (PUT) end point status is 422': (r) => r.status === 422 });
        console.log(`Running PUT(https://jsonplaceholder.typicode.com/users/${new_user_id}/ with field:${item.field} is set to: ${item.value} expected status= 422 actual status=${pos_users.status}`);
    })

    //-----------

    //Verify invalid delete entry  ---- *** Defect, API is returning success when it is not deleting and it shouldn't be 
    pos_users = http.del(`https://jsonplaceholder.typicode.com/users/${new_user_id + 42}`, params);
    check(pos_users, { 'user deletion (del) end point status is 404': (r) => r.status === 404 });
    console.log(`Running DELETE-del(https://jsonplaceholder.typicode.com/users/${new_user_id + 42}/ expected status is 404 actual status=${pos_users.status}`);
}