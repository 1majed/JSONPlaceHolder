import http from "k6/http";
import { check } from "k6";
import { SharedArray } from "k6/data";

// This test is to make sure all the invalid options for photos endpoint are rejected

//invalid_GET_data
const invalid_GET_data = new SharedArray("InvalidPhotoGetValues", function () {
    return JSON.parse(open('./invalid-data-photo.json')).invalid_GET_data;
});

//invalid_POST_data
const invalid_POST_data = new SharedArray("InvalidPhotoPostValues", function () {
    return JSON.parse(open('./invalid-data-photo.json')).invalid_POST_data;
});

//invalid_PUT_data
const invalid_PUT_data = new SharedArray("InvalidPhotoPutValues", function () {
    return JSON.parse(open('./invalid-data-photo.json')).invalid_PUT_data;
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
        
        let re_photos = http.get(`https://jsonplaceholder.typicode.com/photos/${item.value}`);
        check(re_photos, { 'photos (GET) endpoint status is 404': (r) => r.status === 404 });
        console.log(`Running GET(https://jsonplaceholder.typicode.com/photos/${item.value} expected status= 404 actual status=${re_photos.status}`);
    })

    //-----------

    //Verify invalid POST entries -- *** Defect, the API is accepting all invalid options

    invalid_POST_data.forEach((item) => {
        //Create new photo
        let new_photo = {
            "albumId": 1,
            "id": 1,
            "title": "accusamus beatae ad facilis cum similique qui sunt",
            "url": "https://via.placeholder.com/600/92c952",
            "thumbnailUrl": "https://via.placeholder.com/150/92c952"
        };
        console.log(`Here is the initial photo`);
        console.log(new_photo);

        new_photo[item.field] = item.value;
        console.log(`I put the value ${item.value} into the field ${item.field}`);
        console.log(`Here is the new photo`);
        console.log(new_photo);
        let stringified_new_photo = JSON.stringify(new_photo);

        let pos_photos = http.post('https://jsonplaceholder.typicode.com/photos', stringified_new_photo, params);
        check(pos_photos, { 'photo creation (POST) end point status is 422': (r) => r.status === 422 });
        console.log(`Running POST(https://jsonplaceholder.typicode.com/photos/$/ with field:${item.field} is set to: ${item.value} expected status= 422 actual status=${pos_photos.status}`);
    })

    //-----------

    // To be able to modify an existing photo, we need to create one:
    let new_photo = JSON.stringify({
        "albumId": 1,
        "id": 1,
        "title": "accusamus beatae ad facilis cum similique qui sunt",
        "url": "https://via.placeholder.com/600/92c952",
        "thumbnailUrl": "https://via.placeholder.com/150/92c952"
    });
    //Send a POST photo request
    console.log('Adding a photo (POST) with the title simple task');
    let pos_photos = http.post('https://jsonplaceholder.typicode.com/photos', new_photo, params);
    check(pos_photos, { 'photo creation (POST) end point status is 201': (r) => r.status === 201 });
    console.log(`Running POST(https://jsonplaceholder.typicode.com/photos/ expected status= 201 actual status=${pos_photos.status}`);
    let new_photo_id = pos_photos.json().id;
    console.log('the returned new photo ID:' + new_photo_id);

    //-----------

    //Send a duplicate POST photo request
    console.log('Adding a duplicate photo (POST) with the title simple task');
    let dup_pos_photos = http.post('https://jsonplaceholder.typicode.com/photos', new_photo, params);
    check(dup_pos_photos, { 'photo creation (POST) end point status is 4': (r) => r.status === 400 });
    console.log(`Running POST(https://jsonplaceholder.typicode.com/photos expected status= 400 actual status=${pos_photos.status}`);
    let dup_new_photo_id = dup_pos_photos.json().id;
    console.log('the returned duplicate photo ID:' + dup_new_photo_id);

    //-----------


    //Verify invalid PUT entries  ---- *** Defect, API is accepting all values
    invalid_PUT_data.forEach((item) => {
        //Create new photo
        let new_photo = {
            "albumId": 1,
            "id": 1,
            "title": "accusamus beatae ad facilis cum similique qui sunt",
            "url": "https://via.placeholder.com/600/92c952",
            "thumbnailUrl": "https://via.placeholder.com/150/92c952"
        };
        console.log(`Here is the initial photo`);
        console.log(new_photo);

        new_photo[item.field] = item.value;
        console.log(`I put the value ${item.value} into the field ${item.field}`);
        console.log(`Here is the new photo`);
        console.log(new_photo);
        let stringified_new_photo = JSON.stringify(new_photo);

        let pos_photos = http.put(`https://jsonplaceholder.typicode.com/photos/${new_photo_id}`, stringified_new_photo, params);
        check(pos_photos, { 'photo creation (PUT) end point status is 422': (r) => r.status === 422 });
        console.log(`Running PUT(https://jsonplaceholder.typicode.com/photos/${new_photo_id}/ with field:${item.field} is set to: ${item.value} expected status= 422 actual status=${pos_photos.status}`);
    })

    //-----------

    //Verify invalid delete entry  ---- *** Defect, API is returning success when it is not deleting and it shouldn't be 
    pos_photos = http.del(`https://jsonplaceholder.typicode.com/photos/${new_photo_id + 42}`, params);
    check(pos_photos, { 'photo deletion (del) end point status is 404': (r) => r.status === 404 });
    console.log(`Running DELETE-del(https://jsonplaceholder.typicode.com/photos/${new_photo_id + 42}/ expected status is 404 actual status=${pos_photos.status}`);
}