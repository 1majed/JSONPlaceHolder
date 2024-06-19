import http from "k6/http";
import { check } from "k6";
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';



// This test is to make sure all the happy path for photos endpoint are successful

export default function () {

    //Create random title
    let title = randomString(6) + " " + randomString(5);

    //Create a random text_body=>photo_url
    let photo_url = "https://"+randomString(3)+"."+randomString(6) + ".com/600/92c952"  + randomString(5) + "." + randomString(3);

    //Create new photo
    const new_photo = JSON.stringify({
        
        "albumId": 1,
    "id": 1,
    "title": title,
    "url": "https://via.placeholder.com/600/92c952",
    "thumbnailUrl": "https://via.placeholder.com/150/92c952"
    });

    //Update the new user info
    const updated_photo_url = JSON.stringify({
        "albumId": 1,
    "id": 1,
    "title": "accusamus beatae ad facilis cum similique qui sunt",
    "url": photo_url,
    "thumbnailUrl": "https://via.placeholder.com/150/92c952"
    });

    const params = {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    };

    //Send POST request
    console.log('Adding a photo with the title ' + title);
    let pos_photos = http.post('https://jsonplaceholder.typicode.com/photos', new_photo, params);
    console.log(`Running POST(https://jsonplaceholder.typicode.com/photos/ expected status= 201 actual status=${pos_photos.status}`);
    check(pos_photos, { 'photo creation end point status is 201': (r) => r.status === 201 });
    let new_photo_id = pos_photos.json().id;
    console.log('the returned nedw photo ID:' + new_photo_id);

    //GET all entries
    let re_photos = http.get('https://jsonplaceholder.typicode.com/photos');
    check(re_photos, { 'posts endpoint status is 200': (r) => r.status === 200 });

    //See if the last photo created is added to the photos
    // --- Test Failed The POST did not work as expected 
    console.log('getting back a photo with the title ' + title);
    check(re_photos, { 'Verifying if new title is added to photos:': (r) => r.body.includes(title) === true }); // this user does not exist--defect
    console.log(`Running PUT(https://jsonplaceholder.typicode.com/photos/ expected status= 200 actual status=${re_photos.status}`);
    //PUT to update the photo url - Put filed because the new photo url was not added
    console.log('updating the newly created photo with the photo url ' + photo_url);
    let put_photo = http.put('https://jsonplaceholder.typicode.com/photos', updated_photo_url, params);
    console.log(`Running PUT(https://jsonplaceholder.typicode.com/photos/ expected status= 200 actual status=${put_photo.status}`);
    check(put_photo, { 'photos update end point status is 200': (r) => r.status === 200 });
    let new_photo_updated_url = put_photo.json().body;
    console.log('the returned url:' + new_photo_updated_url);

    //GET all entries
    re_photos = http.get('https://jsonplaceholder.typicode.com/photos');
    check(re_photos, { 'photos end point status is 200': (r) => r.status === 200 });

    //See if the url of the last photo created is updated
    // --- Test Failed The POST did not work as expected 
    console.log('getting back a photo with the url ' + new_photo_updated_url);
    check(re_photos, { 'Verifying if the url is updated ': (r) => r.body.includes(new_photo_updated_url) === true }); // this photo does not exist--defect

    //DELETE the last created entry (with the ID: new_photo_id)
    //new_photo --- Defect action is passing even when it is not deleting
    console.log('deleting the photo with the id ' + new_photo_id);
    let del_photo = http.del(`https://jsonplaceholder.typicode.com/photos/${new_photo_id}`, new_photo, params);
    check(del_photo, { 'photo deletion request status is 200': (r) => r.status === 200 });
    console.log(`Running DELTE(https://jsonplaceholder.typicode.com/photos/${new_photo_id} expected status= 200 actual status=${del_photo.status}`);
    console.log('Even when it says it did, photos endpoint is not deleting the photo with the id ' +new_photo_id);
}