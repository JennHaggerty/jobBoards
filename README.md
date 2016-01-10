To run this program, you need a `config/index.js` file.
This takes the format of :
```
module.exports =
{
gmail: 'sender@email.com',
password: 'base64encodedPassword',
jobBoards: [/*rss feed of We Work Remotely,more to come*/],
whiteList: [/*keywords to notify sender of job*/]
}
```
