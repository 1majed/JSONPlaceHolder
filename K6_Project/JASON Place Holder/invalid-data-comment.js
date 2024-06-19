import http from "k6/http";
import { check } from "k6";
import { SharedArray } from "k6/data";

// This test is to make sure all the invalid options for comments endpoint are rejected

//invalid_GET_data
const invalid_GET_data = new SharedArray("InvalidcommentGetValues", function () {
    return JSON.parse(open('./invalid-data-comment.json')).invalid_GET_data;
});

//invalid_POST_data
const invalid_POST_data = new SharedArray("InvalidcommentPostValues", function () {
    return JSON.parse(open('./invalid-data-comment.json')).invalid_POST_data;
});

//invalid_PUT_data
const invalid_PUT_data = new SharedArray("InvalidcommentPutValues", function () {
    return JSON.parse(open('./invalid-data-comment.json')).invalid_PUT_data;
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

        let re_comments = http.get(`https://jsonplaceholder.typicode.com/comments/${item.value}`);
        check(re_comments, { 'comments (GET) endpoint status is 404': (r) => r.status === 404 });
        console.log(`Running GET(https://jsonplaceholder.typicode.com/comments/${item.value} expected status= 404 actual status=${re_comments.status}`);
    })

    //-----------

    //Verify invalid POST entries -- *** Defect, the API is accepting all invalid options

    invalid_POST_data.forEach((item) => {
        //Create new comment
        let new_comment = {
            "userId": 1,
            "id": 1,
            "title": "quidem molestiae enim"
        };
        console.log(`Here is the initial comment`);
        console.log(new_comment);

        new_comment[item.field] = item.value;
        console.log(`I put the value ${item.value} into the field ${item.field}`);
        console.log(`Here is the new comment`);
        console.log(new_comment);
        let stringified_new_comment = JSON.stringify(new_comment);

        let pos_comments = http.post('https://jsonplaceholder.typicode.com/comments', stringified_new_comment, params);
        check(pos_comments, { 'comment creation (POST) end point status is 422': (r) => r.status === 422 });
        console.log(`Running POST(https://jsonplaceholder.typicode.com/comments/$/ with field:${item.field} is set to: ${item.value} expected status= 422 actual status=${pos_comments.status}`);
    })

    //-----------

    // To be able to modify an existing comment, we need to create one:
    let new_comment = JSON.stringify({
        "userId": 1,
        "id": 1,
        "title": "quidem molestiae enim"
    });
    //Send a POST comment request
    console.log('Adding a comment (POST) with the title simple task');
    let pos_comments = http.post('https://jsonplaceholder.typicode.com/comments', new_comment, params);
    check(pos_comments, { 'comment creation (POST) end point status is 201': (r) => r.status === 201 });
    console.log(`Running POST(https://jsonplaceholder.typicode.com/comments/$/ expected status= 422 actual status=${pos_comments.status}`);
    let new_comment_id = pos_comments.json().id;
    console.log('the returned new comment ID:' + new_comment_id);

    //-----------
    // Try to create a duplicate record   *** Defect Duplicates allowed
    //Send a POST comment request
    console.log('Adding a duplicate comment (POST) with the title simple task');
    let dup_pos_comments = http.post('https://jsonplaceholder.typicode.com/comments', new_comment, params);
    check(dup_pos_comments, { 'comment creation (POST) end point status is 400': (r) => r.status === 400 });
    console.log(`Running POST(https://jsonplaceholder.typicode.com/comments/$/ expected status= 422 actual status=${dup_pos_comments.status}`);
    let dup_new_comment_id = pos_comments.json().id;
    console.log('the returned new comment duplicate ID:' + dup_new_comment_id);

    //-----------

    //Verify invalid PUT entries  ---- *** Defect, API is accepting all values
    invalid_PUT_data.forEach((item) => {
        //Create new comment
        let new_comment = {
            "userId": 1,
            "id": 1,
            "title": "quidem molestiae enim"
        };
        console.log(`Here is the initial comment`);
        console.log(new_comment);

        new_comment[item.field] = item.value;
        console.log(`I put the value ${item.value} into the field ${item.field}`);
        console.log(`Here is the new comment`);
        console.log(new_comment);
        let stringified_new_comment = JSON.stringify(new_comment);

        let pos_comments = http.put(`https://jsonplaceholder.typicode.com/comments/${new_comment_id}`, stringified_new_comment, params);
        check(pos_comments, { 'comment creation (PUT) end point status is 422': (r) => r.status === 422 });
        console.log(`Running PUT(https://jsonplaceholder.typicode.com/comments/${new_comment_id}/ with field:${item.field} is set to: ${item.value} expected status= 422 actual status=${pos_comments.status}`);
    })

    //-----------

    //Verify invalid delete entry  ---- *** Defect, API is returning success when it is not deleting and it shouldn't be 
    pos_comments = http.del(`https://jsonplaceholder.typicode.com/comments/${new_comment_id + 42}`, params);
    check(pos_comments, { 'comment deletion (del) end point status is 404': (r) => r.status === 404 });
    console.log(`Running DELETE-del(https://jsonplaceholder.typicode.com/comments/${new_comment_id + 42}/ expected status is 404 actual status=${pos_comments.status}`);
}