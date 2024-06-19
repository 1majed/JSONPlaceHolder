import http from "k6/http";
import { check } from "k6";
import { SharedArray } from "k6/data";

// This test is to make sure all the invalid options for albums endpoint are rejected

//invalid_GET_data
const invalid_GET_data = new SharedArray("InvalidalbumGetValues", function () {
    return JSON.parse(open('./invalid-data-album.json')).invalid_GET_data;
});

//invalid_POST_data
const invalid_POST_data = new SharedArray("InvalidalbumPostValues", function () {
    return JSON.parse(open('./invalid-data-album.json')).invalid_POST_data;
});

//invalid_PUT_data
const invalid_PUT_data = new SharedArray("InvalidalbumPutValues", function () {
    return JSON.parse(open('./invalid-data-album.json')).invalid_PUT_data;
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
        
        let re_albums = http.get(`https://jsonplaceholder.typicode.com/albums/${item.value}`);
        check(re_albums, { 'albums (GET) endpoint status is 404': (r) => r.status === 404 });
        console.log(`Running GET(https://jsonplaceholder.typicode.com/albums/${item.value} expected status= 404 actual status=${re_albums.status}`);
    })

    //-----------

    //Verify invalid POST entries -- *** Defect, the API is accepting all invalid options

    invalid_POST_data.forEach((item) => {
        //Create new album
        let new_album = {
            "userId": 1,
            "id": 1,
            "title": "quidem molestiae enim"
          };
        console.log(`Here is the initial album`);
        console.log(new_album);

        new_album[item.field] = item.value;
        console.log(`I put the value ${item.value} into the field ${item.field}`);
        console.log(`Here is the new album`);
        console.log(new_album);
        let stringified_new_album = JSON.stringify(new_album);

        let pos_albums = http.post('https://jsonplaceholder.typicode.com/albums', stringified_new_album, params);
        check(pos_albums, { 'album creation (POST) end point status is 422': (r) => r.status === 422 });
        console.log(`Running POST(https://jsonplaceholder.typicode.com/albums/$/ with field:${item.field} is set to: ${item.value} expected status= 422 actual status=${pos_albums.status}`);
    })

    //-----------

    // To be able to modify an existing album, we need to create one:
    let new_album = JSON.stringify({
        "userId": 1,
        "id": 1,
        "title": "quidem molestiae enim"
      });
    //Send a POST album request
    console.log('Adding a album (POST) with the title simple task');
    let pos_albums = http.post('https://jsonplaceholder.typicode.com/albums', new_album, params);
    console.log(`Running POST(https://jsonplaceholder.typicode.com/albums/$/ expected status= 422 actual status=${pos_albums.status}`);
    check(pos_albums, { 'album creation (POST) end point status is 201': (r) => r.status === 201 });
    let new_album_id = pos_albums.json().id;
    console.log('the returned new album ID:' + new_album_id);


    //-----------

    // Trying to create a duplicate album
    
    //Send a duplicate POST album request
    console.log('Adding a duplicate album (POST) with the title simple task');
    let dup_pos_albums = http.post('https://jsonplaceholder.typicode.com/albums', new_album, params);
    check(dup_pos_albums, { 'album creation (POST) end point status is 400': (r) => r.status === 400 });
    console.log(`Running POST(https://jsonplaceholder.typicode.com/albums/$/ expected status= 400 actual status=${dup_pos_albums.status}`);
    let dup_new_album_id = dup_pos_albums.json().id;
    console.log('the returned duplicate album ID:' + dup_new_album_id);

    //-----------

    //Verify invalid PUT entries  ---- *** Defect, API is accepting all values
    invalid_PUT_data.forEach((item) => {
        //Create new album
        let new_album = {
            "userId": 1,
            "id": 1,
            "title": "quidem molestiae enim"
          };
        console.log(`Here is the initial album`);
        console.log(new_album);

        new_album[item.field] = item.value;
        console.log(`I put the value ${item.value} into the field ${item.field}`);
        console.log(`Here is the new album`);
        console.log(new_album);
        let stringified_new_album = JSON.stringify(new_album);

        let pos_albums = http.put(`https://jsonplaceholder.typicode.com/albums/${new_album_id}`, stringified_new_album, params);
        check(pos_albums, { 'album creation (PUT) end point status is 422': (r) => r.status === 422 });
        console.log(`Running PUT(https://jsonplaceholder.typicode.com/albums/${new_album_id}/ with field:${item.field} is set to: ${item.value} expected status= 422 actual status=${pos_albums.status}`);
    })

    //-----------

    //Verify invalid delete entry  ---- *** Defect, API is returning success when it is not deleting and it shouldn't be 
    pos_albums = http.del(`https://jsonplaceholder.typicode.com/albums/${new_album_id + 42}`, params);
    check(pos_albums, { 'album deletion (del) end point status is 404': (r) => r.status === 404 });
    console.log(`Running DELETE-del(https://jsonplaceholder.typicode.com/albums/${new_album_id + 42}/ expected status is 404 actual status=${pos_albums.status}`);
}