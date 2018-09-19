# Karpul_server

##API endspoints
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
