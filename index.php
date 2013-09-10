<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<title>Examples</title>
<meta name="description" content="">
<meta name="keywords" content="">
<link href="" rel="stylesheet">
<script type="text/javascript" src="js/validator.js"></script>
<style>
	form { margin-bottom: 40px;}
	.row { margin-bottom: 10px;}
</style>
</head>
<body>
    <form name="form_1" action="action1.php" method="POST">
    	<div class="row">
    		username: <input name="username" id="username" type="text" />
    	</div>
    	<div class="row">
    		password: <input name="password" id="password" type="text" />
    	</div>
    	<div class="row">
    		<button type="submit">submit</button>
    	</div>
    </form>
    <form name="form_2" action="action2.php" method="POST">
    	<div class="row">
    		email: <input name="email" id="email" type="text" />
    	</div>
    	<div class="row">
    		blue <input name="blue" id="blue" type="checkbox" />
    		red <input name="red" id="red" type="checkbox" />
    	</div>
    	<div class="row">
    		male <input id="male" type="radio" name="sex" checked="checked" />
    		female <input id="female" type="radio" name="sex" />
    	</div>
    	<div class="row">
    		<button type="submit">submit</button>
    	</div>
    </form>
</body>
</html>
<script type="text/javascript">
	var fields = [
		{
			name: 'username',
			rules: 'required|alpha_num_dash',
			display: 'name'
		}, {
			name: 'password',
			rules: 'required|min_length[6]|alpha_num_dash'
		}
	];
	new Validator('form_1', fields);
</script>