import http from "k6/http";
import { check } from "k6";
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';



// This test is to make sure all the happy path  for posts endpoint are successful

export default function () {

    //Create random title
    let title = randomString(6) + " " + randomString(5);

    //Create a random text_body
    let text_body = randomString(6) + "@" + randomString(5) + "." + randomString(3);

    //Create new post
    const new_post = JSON.stringify({
        "userId": 1,
        "id": 1,
        "title": title,
        "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
    });

    //Update the new user info
    const updated_post_body = JSON.stringify({
        "userId": 1,
        "id": 1,
        "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
        "body": text_body
    });

    const params = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    };

    //Send POST request
    console.log('Adding a post with the title ' + title);
    let pos_posts = http.post('https://jsonplaceholder.typicode.com/posts', new_post, params);
    check(pos_posts, { 'post creation end point status is 201': (r) => r.status === 201 });
    console.log(`Running POST(https://jsonplaceholder.typicode.com/posts/ expected status= 201 actual status=${pos_posts.status}`);
    let new_post_id = pos_posts.json().id;
    console.log('the returned nedw post ID:' + new_post_id);

    //GET all entries
    let re_posts = http.get('https://jsonplaceholder.typicode.com/posts');
    check(re_posts, { 'posts endpoint status is 200': (r) => r.status === 200 });

    //See if the last post created is added to the posts
    // --- Test Failed The POST did not work as expected 
    console.log('getting back a post with the title ' + title);
    check(re_posts, { 'Verifying if new title is added to posts:': (r) => r.body.includes(title) === true }); // this user does not exist--defect

    //PUT to update the post body - Put filed because the new post body was not added
    console.log('updating the newly created post with the post body ' + text_body);
    let put_post = http.put('https://jsonplaceholder.typicode.com/posts', updated_post_body, params);
    check(put_post, { 'posts update end point status is 200': (r) => r.status === 200 });
    console.log(`Running PUT(https://jsonplaceholder.typicode.com/posts/ expected status= 200 actual status=${put_post.status}`);
    let new_post_updated_body = put_post.json().body;
    console.log('the returned body:' + new_post_updated_body);

    //GET all entries
    re_posts = http.get('https://jsonplaceholder.typicode.com/posts');
    check(re_posts, { 'posts end point status is 200': (r) => r.status === 200 });

    //See if the body of the last post created is updated
    // --- Test Failed The POST did not work as expected 
    console.log('getting back a posts with the body ' + new_post_updated_body);
    check(re_posts, { 'Verifying if the body is updated ': (r) => r.body.includes(new_post_updated_body) === true }); // this post does not exist--defect

    //DELETE the last created entry (with the ID: new_post_id)
    //new_post --- Defect action is passing even when it is not deleting
    console.log('deleting the post with the id ' + new_post_id);
    let del_post = http.del(`https://jsonplaceholder.typicode.com/posts/${new_post_id}`, new_post, params);
    check(del_post, { 'post deletion request status is 200': (r) => r.status === 200 });
    console.log(`Running DELTE(https://jsonplaceholder.typicode.com/posts/${new_post_id} expected status= 200 actual status=${del_post.status}`);
    console.log('Even when it says it did, posts endpoint is not deleting the post with the id ' +new_post_id);
}