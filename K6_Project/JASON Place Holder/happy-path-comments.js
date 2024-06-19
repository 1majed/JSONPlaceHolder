import http from "k6/http";
import { check } from "k6";
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';



// This test is to make sure the happy path for comments endpoint is successful

export default function () {

    //Create random name
    let name = randomString(6) + " " + randomString(5);

    //Create a random text_body
    let text_body = randomString(6) + "@" + randomString(5) + "." + randomString(3);

    //Create new comment
    const new_comment = JSON.stringify({
        "postId": 1,
        "id": 1,
        "name": name,
        "email": "Eliseo@gardner.biz",
        "body": "laudantium enim quasi est quidem magnam voluptate ipsam eos\ntempora quo necessitatibus\ndolor quam autem quasi\nreiciendis et nam sapiente accusantium"
    });

    //Update the new user info
    const updated_comment_body = JSON.stringify({
        "postId": 1,
        "id": 1,
        "name": "id labore ex et quam laborum",
        "email": "Eliseo@gardner.biz",
        "body": text_body
    });

    const params = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    };

    //Send comment request
    console.log('Adding a comment with the name ' + name);
    let pos_comments = http.post('https://jsonplaceholder.typicode.com/comments', new_comment, params);
    check(pos_comments, { 'comment creation end point status is 201': (r) => r.status === 201 });
    let new_comment_id = pos_comments.json().id;
    console.log(`Running POST(https://jsonplaceholder.typicode.com/comments/ expected status= 201 actual status=${pos_comments.status}`);
    console.log('the returned new comment ID:' + new_comment_id);

    //GET all entries
    let re_comments = http.get('https://jsonplaceholder.typicode.com/comments');
    check(re_comments, { 'comments endpoint status is 200': (r) => r.status === 200 });

    //See if the last comment created is added to the comments
    // --- Test Failed The POST did not work as expected 
    console.log('getting back a comment with the name ' + name);
    check(re_comments, { 'Verifying if new name is added to comments:': (r) => r.body.includes(name) === true }); // this comment does not exist--defect

    //PUT to update the comment body - Put filed because the new comment body was not added
    console.log('updating the newly created comment with the comment body ' + text_body);
    let put_comment = http.put('https://jsonplaceholder.typicode.com/comments', updated_comment_body, params);
    console.log(`Running PUT(https://jsonplaceholder.typicode.com/comments/ expected status= 200 actual status=${put_comment.status}`);
    check(put_comment, { 'comments update end point status is 200': (r) => r.status === 200 });
    let new_comment_updated_body = put_comment.json().body;
    console.log('the returned body:' + new_comment_updated_body);

    //GET all entries
    re_comments = http.get('https://jsonplaceholder.typicode.com/comments');
    check(re_comments, { 'get comments end point status is 200': (r) => r.status === 200 });

    //See if the body of the last comment created is updated
    // --- Test Failed The comment did not work as expected 
    console.log('getting back a comments with the body ' + new_comment_updated_body);
    check(re_comments, { 'Verifying if the body is updated ': (r) => r.body.includes(new_comment_updated_body) === true }); // this comment does not exist--defect

    //DELETE the last created entry (with the ID: new_comment_id)
    //new_comment --- Defect action is passing even when it is not deleting
    console.log('deleting the comment with the id ' + new_comment_id);
    let del_comment = http.del(`https://jsonplaceholder.typicode.com/comments/${new_comment_id}`, new_comment, params);
    console.log(`Running DELTE(https://jsonplaceholder.typicode.com/comments/${new_comment_id} expected status= 200 actual status=${del_comment.status}`);
    check(del_comment, { 'comment deletion request status is 200': (r) => r.status === 200 });
    console.log('Even when it says it did, comments endpoint is not deleting the comment with the id ' + new_comment_id);
}