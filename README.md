# Karpul_server

## API endspoints
-----------------
All requests and responses are in JSON format.

|Action|Path|
|------|----|
|Users|https://karpul-server.herokuapp.com/api/users|
|Authentication|https://karpul-server.herokuapp.com/api/auth|
|Carpools|https://karpul-server.herokuapp.com/api/carpools|
|Find Carpools|https://karpul-server.herokuapp.com/api/findCarpool|
|Image Upload|https://karpul-server.herokuapp.com/api/profilePic|

## Users
`POST` request to endpoint `/` is for creating user documents. It accepts the following request body,
```
{
  username,
  password,
  firstName, 
  lastName,
  phone
}
```
username will be rejected if it is not a unique email. Once a user document is successfully created, this will be the server's response.
```
{
  id,
  username,
  firstName,
  lastName,
  phone,
  city,
  state,
  bio,
  profilePicUrl
}
```
profilePic is an object for storing a user's profile picture on Cloudinary's server.

`POST` request to endpoint `/userData` settings will modify some of a user's info. It accepts the following request body,
```
{
  id,
  bio,
  phone,
  state,
  city
}
```

`POST` request to endpoint `/:id` settings will modify the user's profile pic url. It accepts the following request body,
```
{
  profilePicUrl
}
```
## Authentication
`POST` to `/login` endpoint for creation of JWT. It accepts the following request body,
```
{
  username,
  password
}
```
This endpoint takes in the username and verifies the password. When validated, the server will respond with a token,
```
{
  authToken
}
```
`POST` to `/refresh` will send back another token with a newer expiriation. No request body is necessary as an existing and valid JWT must be provided to access this endpoint.

## Carpools
`POST` request to endpoint `/` is for creating carpools. It accepts the following request body,
```
{
  carpoolTitle, 
  startAddress, 
  endAddress, 
  arrivalTime, 
  openSeats, 
  details, 
  days
}
```
Once a carpool document is successfully created, this will be the server's response.
```
{
  id,
  carpoolTitle, 
  startAddress, 
  endAddress, 
  arrivalTime, 
  openSeats,
  host,
  details, 
  days,
  users,
  pendingRequests
  
}
```
`DELETE` request to `/` will delete a carpool document. It accepts the following request body.
```
{
  carpoolId
}
```
The server will respond with status 204 whether or not the account exists.

## Find Carpools

`GET` request to endpoint '/' is for finding nearby carpools. It accepts the following request query,
```
{
  address,
  days,
  from,
  to,
  radius
}
```
The server will respond with an array or carpool documents.
