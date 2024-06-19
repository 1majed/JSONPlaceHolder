import http from "k6/http";
import { check } from "k6";
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';


// This test is to make sure the happy path for albums endpoint is successful

export default function () {

    //Create random title
    let title = randomString(6) + " " + randomString(5);
    //Create random title2
    let title2 = randomString(6) + " " + randomString(5);

    //Create new album
    const new_album = JSON.stringify({
    "userId": 1,
    "id": 1,
    "title": title
    });
    //Update the new user info

    const updated_album_title2 = JSON.stringify({
        "userId": 1,
        "title": title2
    });

    const params = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    };

    //Send album request
    console.log('Adding a album (POST) with the title ' + title);
    let pos_albums = http.post('https://jsonplaceholder.typicode.com/albums', new_album, params);
    check(pos_albums, { 'album creation (POST) end point status is 201': (r) => r.status === 201 });
    console.log(`Running POST(https://jsonplaceholder.typicode.com/albums/ expected status= 201 actual status=${pos_albums.status}`);
    let new_album_id = pos_albums.json().id;
    console.log('the returned new album ID:' + new_album_id);

    //GET all entries
    let re_albums = http.get('https://jsonplaceholder.typicode.com/albums');
    check(re_albums, { 'albums (GET) endpoint status is 200': (r) => r.status === 200 });

    //See if the last album created is added to the albums
    // --- Test Failed The POST did not work as expected 
    console.log('getting back (GET) an album with the title ' + title);
    check(re_albums, { 'Verifying if new title is added to albums:': (r) => r.body.includes(title) === true }); // this album does not exist--defect

    //PUT to update the album title - Put filed because the new album title was not added
    console.log('updating (PUT) the newly created album with the album second title ' + title2);
    let put_album = http.put('https://jsonplaceholder.typicode.com/albums', updated_album_title2, params);
    console.log(`Running PUT(https://jsonplaceholder.typicode.com/albums/${new_album_id}/ with title is set to: ${title2} expected status= 200 actual status=${put_album.status}`);
    check(put_album, { 'albums (PUT) update end point status is 200': (r) => r.status === 200 });
    let new_album_updated_title2 = put_album.json().title2;
    console.log('the returned title2:' + new_album_updated_title2);

    //GET all entries
    re_albums = http.get('https://jsonplaceholder.typicode.com/albums');
    check(re_albums, { 'get (GET) albums end point status is 200': (r) => r.status === 200 });

    //See if the title2 of the last album created is updated
    // --- Test Failed The album did not work as expected 
    console.log('getting (GET) back a albums with the second title ' + new_album_updated_title2);
    check(re_albums, { 'Verifying (GET) if the second title is updated ': (r) => r.body.includes(new_album_updated_title2) === true }); // this album does not exist--defect

    //DELETE the last created entry (with the ID: new_album_id)
    //new_album --- Defect action is passing even when it is not deleting
    console.log('deleting (DELETE) the album with the id ' + new_album_id);
    let del_album = http.del(`https://jsonplaceholder.typicode.com/albums/${new_album_id}`, new_album, params);
    check(del_album, { 'album deletion (DELETE) request status is 200': (r) => r.status === 200 });
    console.log(`Running DELTE(https://jsonplaceholder.typicode.com/albums/${new_album_id}/ expected status= 200 actual status=${del_album.status}`);
    console.log('Even when it says it did, albums endpoint is not deleting the album with the id ' + new_album_id);
}