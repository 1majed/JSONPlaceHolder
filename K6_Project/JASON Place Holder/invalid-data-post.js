import http from "k6/http";
import { check } from "k6";
import { SharedArray } from "k6/data";

// This test is to make sure all the invalid options for posts endpoint are rejected

//invalid_GET_data
const invalid_GET_data = new SharedArray("InvalidpostGetValues", function () {
    return JSON.parse(open('./invalid-data-post.json')).invalid_GET_data;
});

//invalid_POST_data
const invalid_POST_data = new SharedArray("InvalidpostPostValues", function () {
    return JSON.parse(open('./invalid-data-post.json')).invalid_POST_data;
});

//invalid_PUT_data
const invalid_PUT_data = new SharedArray("InvalidpostPutValues", function () {
    return JSON.parse(open('./invalid-data-post.json')).invalid_PUT_data;
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

        let re_posts = http.get(`https://jsonplaceholder.typicode.com/posts/${item.value}`);
        check(re_posts, { 'posts (GET) endpoint status is 404': (r) => r.status === 404 });
        console.log(`Running GET(https://jsonplaceholder.typicode.com/posts/${item.value} expected status= 404 actual status=${re_posts.status}`);
    })

    //-----------

    //Verify invalid POST entries -- *** Defect, the API is accepting all invalid options

    invalid_POST_data.forEach((item) => {
        //Create new post
        let new_post = {
            "userId": 1,
            "id": 1,
            "title": "quidem molestiae enim"
        };
        console.log(`Here is the initial post`);
        console.log(new_post);

        new_post[item.field] = item.value;
        console.log(`I put the value ${item.value} into the field ${item.field}`);
        console.log(`Here is the new post`);
        console.log(new_post);
        let stringified_new_post = JSON.stringify(new_post);

        let pos_posts = http.post('https://jsonplaceholder.typicode.com/posts', stringified_new_post, params);
        check(pos_posts, { 'post creation (POST) end point status is 422': (r) => r.status === 422 });
        console.log(`Running POST(https://jsonplaceholder.typicode.com/posts/ with field:${item.field} is set to: ${item.value} expected status= 422 actual status=${pos_posts.status}`);
    })

    //-----------

    // To be able to modify an existing post, we need to create one:
    let new_post = JSON.stringify({
        "userId": 1,
        "id": 1,
        "title": "quidem molestiae enim"
    });
    //Send a POST post request
    console.log('Adding a post (POST) with the title simple task');
    let pos_posts = http.post('https://jsonplaceholder.typicode.com/posts', new_post, params);
    check(pos_posts, { 'post creation (POST) end point status is 201': (r) => r.status === 201 });
    console.log(`Running POST(https://jsonplaceholder.typicode.com/posts/ expected status= 422 actual status=${pos_posts.status}`);
    let new_post_id = pos_posts.json().id;
    console.log('the returned new post ID:' + new_post_id);
    //-----------
    // attempt to create duplicate records *** defect, it is allowing duplicates.

    //Send a POST post request
    console.log('Adding a duplicate post (POST) with the title simple task');
    let dup_pos_posts = http.post('https://jsonplaceholder.typicode.com/posts', new_post, params);
    check(dup_pos_posts, { 'post creation (POST) end point status is 400': (r) => r.status === 400 });
    console.log(`Running POST(https://jsonplaceholder.typicode.com/posts/ expected status= 400 actual status=${dup_pos_posts.status}`);
    let dup_new_post_id = dup_pos_posts.json().id;
    console.log('the returned new post ID:' + dup_new_post_id);


    //-----------

    //Verify invalid PUT entries  ---- *** Defect, API is accepting all values
    invalid_PUT_data.forEach((item) => {
        //Create new post
        let new_post = {
            "userId": 1,
            "id": 1,
            "title": "quidem molestiae enim"
        };
        console.log(`Here is the initial post`);
        console.log(new_post);

        new_post[item.field] = item.value;
        console.log(`I put the value ${item.value} into the field ${item.field}`);
        console.log(`Here is the new post`);
        console.log(new_post);
        let stringified_new_post = JSON.stringify(new_post);

        let pos_posts = http.put(`https://jsonplaceholder.typicode.com/posts/${new_post_id}`, stringified_new_post, params);
        check(pos_posts, { 'post creation (PUT) end point status is 422': (r) => r.status === 422 });
        console.log(`Running PUT(https://jsonplaceholder.typicode.com/posts/${new_post_id}/ with field:${item.field} is set to: ${item.value} expected status= 422 actual status=${pos_posts.status}`);
    })

    //-----------

    //Verify invalid delete entry  ---- *** Defect, API is returning success when it is not deleting and it shouldn't be 
    pos_posts = http.del(`https://jsonplaceholder.typicode.com/posts/${new_post_id + 42}`, params);
    check(pos_posts, { 'post deletion (del) end point status is 404': (r) => r.status === 404 });
    console.log(`Running DELETE-del(https://jsonplaceholder.typicode.com/posts/${new_post_id + 42}/ expected status is 404 actual status=${pos_posts.status}`);


}