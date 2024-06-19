Part 1:
-------

The JASON Place Holder application has 6 endpoints.

Overview
Since the endpoints are for testing purposes, I made some assumptions about the system behavior. 
I selected K6 as the tool of choice because it satisfies the requirement Javascript/nodeJS and it gives me exposure to the tool that I might be able to work on. The field is wide open,but
choosing this tool, accomplishes two goals in one. The tool is already available to the reviewers, which will make it easier to dowload and run. One of the areas I would like to improve on is 
exporting the results and showing a better log of the test results. Currently there are logs that describe important steps. Given more time, more combinations of test data can be added.

API assumptions based on the data:
user is connected to posts through “userId”
user is connected to albums through “userId”
user is connected to todos through “userId”
post is connected to comments through “postId”
photo is connected to albums through “albumId”

users => posts => comments
users => albums => photos 
users => todos

Tests
- Smoke test is to verify each of the end points is responsive. This test should be run first to make sure the endpoints are up and available.
    To run this test, use: k6 run smoke-test.js

To tee the HTTP information, please add the teag: --http-debug or --http-debug="full" to expose all of the data exchange.
- Happy path:
	- Verify User endpoint for:
		POST
		GET
		PUT
		DELETE
to run these tests, use:
    k6 run happy-path-albums.js            
    k6 run happy-path-users.js                
    k6 run happy-path-photos.js    
    k6 run happy-path-todos.js     
    k6 run happy-path-comments.js      
    k6 run happy-path-posts.js      

Invalid data
These tests use JSON files with fied/data paires. Ecah endpont has a javascript file and a JSON file.

GET endpoint will be tested for the following:
- Invalid keys (Null, wrong data type, large values )
POST will be tested for:
- Invalid keys (Null, wrong data type)
- Invalid data type (number for string field, string for number fields)
- Invalid data (text too long, number too large, wrong kind of number, special characters and blank)
PUT:
- Invalid keys (Null, wrong data type)
- Invalid data type (number for string field, string for number fields)
- Invalid data (text too long, number too large, wrong kind of number, special characters and blank)
DELETE(del)
- Invalid keys (Null, wrong data type)
To run these tests, use:
    k6 run invalid-data-photo.js             
    k6 run invalid-data-album.js                    
    k6 run invalid-data-user.js                     
    k6 run invalid-data-post.js            
    k6 run invalid-data-comment.js                  
    k6 run invalid-data-todo.js   

Each of the tests also included the scenario to create duplicate records. 

PART 2:
-------
I attached the document for the performance test in this folder for your review.

Thank you for you consideration!

Majed Alssaidi
majed1@icloud.com
