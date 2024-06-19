import http from "k6/http";
import { check } from "k6";

// This test is to make sure all the endpoints are accessible and responsive

export default function(){

    let re_users = http.get('https://jsonplaceholder.typicode.com/users');
    let re_posts = http.get('https://jsonplaceholder.typicode.com/posts');
    let re_comments = http.get('https://jsonplaceholder.typicode.com/comments');
    let re_albums= http.get('https://jsonplaceholder.typicode.com/albums');
    let re_photos = http.get('https://jsonplaceholder.typicode.com/photos');
    let re_todos = http.get('https://jsonplaceholder.typicode.com/todos');
    
    // Verify a successful response for each end point
    check (re_users,{'users end point status is 200':(r) => r.status === 200})
    check (re_posts,{'posts end point status is 200':(r) => r.status === 200})
    check (re_comments,{'comments end point status is 200':(r) => r.status === 200})
    check (re_albums,{'albums end point status is 200':(r) => r.status === 200})
    check (re_photos,{'photos endpoint status is 200':(r) => r.status === 200}) 
    check (re_todos,{'todos end point status is 200':(r) => r.status === 200})
}