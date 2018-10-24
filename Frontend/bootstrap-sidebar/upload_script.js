$(function(){

	$("#drop-box").click(function(){
		$("#upl").click();
	});

	// To prevent Browsers from opening the file when its dragged and dropped on to the page
	$(document).on('drop dragover', function (e) {
        e.preventDefault();
    });

	// Add events
	$('input[type=file]').on('change', fileUpload);

	// File uploader function

	function fileUpload(event){
		$("#drop-box").html("<p>"+event.target.value+" uploading...</p>");
		files = event.target.files;
		var data = new FormData();
		var error = 0;
		for (var i = 0; i < files.length; i++) {
  			var file = files[i];
			// if(!file.type.match('image.*')) {
		   	// 	$("#drop-box").html("<p> Images only. Select another file</p>");
		   	// 	error = 1;
		  	// }
			// else if(file.size > 1048576){
		  	// 	$("#drop-box").html("<p> Too large Payload. Select another file</p>");
		   	// 	error = 1;
		  	// }
			// else{
		  	data.append('file', file);
		  	// }
			data.append('remark', 'hello')
	 	}
	 	if(!error){
            $.ajax({
                url: "http://127.0.0.1:8000/beads/upload",
                data: data,
                cache: false,
                contentType: false,
                processData: false,
                type: 'POST',
                success: function(result) {
    					$("#drop-box").html("File Uploaded.");
						// makeState()
                },
				error: function(xhr,status,error){
					$("#drop-box").html("<p> Error in upload, try again.</p>");
					// console.log(status, xhr, error);
				}
            });
		}
	}

});
