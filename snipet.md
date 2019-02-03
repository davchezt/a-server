```js
module.exports = (length = 5) => {
  // let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let charactersLength = characters.length;
  let randomString = '';
  for (var i = 0; i < length; i++) {
    var rand = Math.round(Math.random() * charactersLength - 1);
    if (characters[rand]) {
      randomString += characters[rand];
    }
    else {
      randomString += characters[charactersLength - 1];
    }
  }
  return randomString;
}
```


You can't use both ```$set``` and ```$push``` in the same update expression as nested operators.

The correct syntax for using the update operators follows:
```js
{
   <operator1>: { <field1>: <value1>, ... },
   <operator2>: { <field2>: <value2>, ... },
   ...
}
```
where ```<operator1>```, ```<operator2>``` can be from any of the update operators list specified here.

For adding a new element to the array, a single ```$push``` operator will suffice e.g. you can use the findByIdAndUpdate update method to return the modified document as
```js
Employeehierarchy.findByIdAndUpdate(employeeparent._id,
    { "$push": { "childrens": employee._id } },
    { "new": true, "upsert": true },
    function (err, managerparent) {
        if (err) throw err;
        console.log(managerparent);
    }
);
```
Using your original ```update()``` method, the syntax is
```js
Employeehierarchy.update(
   { "_id": employeeparent._id},
   { "$push": { "childrens": employee._id } },
   function (err, raw) {
       if (err) return handleError(err);
       console.log('The raw response from Mongo was ', raw);
   }
);
```
in which the callback function receives the arguments ```(err, raw)``` where

err is the error if any occurred
raw is the full response from Mongo
Since you want to check the modified document, I'd suggest you use the findByIdAndUpdate function since the ```update()``` method won't give you the modified document, just the full write result from mongo.

If you want to update a field in the document and add an element to an array at the same time then you can do
```js
Employeehierarchy.findByIdAndUpdate(employeeparent._id,
    { 
        "$set": { "name": "foo" },
        "$push": { "childrens": employee._id } 
    } 
    { "new": true, "upsert": true },
    function (err, managerparent) {
        if (err) throw err;
        console.log(managerparent);
    }
);
```
The above will update the name field to "foo" and add the employee id to the childrens array.

### BULK UPDATE
```js
var bulk = People.collection.initializeOrderedBulkOp();
    bulk.find({'_id': {$in: []}}).update({$set: {status: 'active'}});
    bulk.execute(function (error) {
        callback();                   
    });
```

### Find IN

If teamIds is already an array, then you shouldn't wrap it in another array like you are:
```js
Team.find({
    '_id': { $in: teamIds }
}, function(err, teamData) {
    console.log("teams name  " + teamData);
});
```
Or, if teamIds is just a string of comma-separated values, then you need to convert it to an array using split:
```js
Team.find({
    '_id': { $in: teamIds.split(',') }
}, function(err, teamData) {
    console.log("teams name  " + teamData);
});
```