const router = require('express').Router();

router.get('/', (req, res, next)=>{
    console.log(req.sessionID)
    res.render('index');
});


module.exports = router;