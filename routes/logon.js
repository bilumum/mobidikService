

exports.performLogon = function(req, res){

   console.log(req.params.userName);
   console.log(req.params.password);

    var userName = req.params.userName;
    var password = req.params.password;

    var result = {
        logonResult : 0,
        dummyMember : 'dummy'
    }

    if(userName == "admin" && password == "123456")
        result.logonResult = 1
    else
        result.logonResult = 0

    res.json(result);
}

