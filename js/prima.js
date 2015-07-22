var BookedSeats = [];
var Rows=["A","B","C","D","E","F","G","H","I","J"];
var Columns=12;
var TotalSeats=Rows.length*Columns;
var InitialView = Backbone.View.extend({
	events:{
		"click #submitSelection": "submitForm"
	},
	submitForm : function(){
		var reservedseats=JSON.parse(localStorage.getItem('ReservedSeats'));
		var availableSeats=120;
		// var numberRegex=new RegExp('^[0-9]*$')
		if(reservedseats!=null)
			availableSeats=TotalSeats-reservedseats.length;
		if(!$('#name').val()){
			$(".requiredElements").html("Name is required");
		}
		else if(!$('#seats').val()){
			$(".requiredElements").html("Number of seats is required");
		}
		// else if(!numberRegex.test($('#seats').val())) {
		// 	$(".requiredElements").html("Please enter a valid number");
		// }
		else if(parseInt($('#seats').val())>availableSeats){
			$(".requiredElements").html("You can only select "+availableSeats+" seats")
		}
		else
		{
			$(".requiredElements").html("");
			screenUI.showView();
		}
	}
});

var initialView = new InitialView({el:$('.selectionForm')});

var ScreenUI=Backbone.View.extend({
	events:{
		"click .empty-seat":"toggleBookedSeat",
		"click #back":"back",
		"click #confirmSelection":"bookTickets"
	},
	initialize:function(){
		var tableheaderTemplate = _.template($("#table-screen-header").html());
		var tableBodyTemplate=_.template($("#table-screen-body").html());
		var data={"rows":Rows,"columns":Columns};
		$("#screen-head").after(tableheaderTemplate(data));
		$("#screen-body").after(tableBodyTemplate(data));	
	},
	hideView:function(){
		$(this.el).hide();
	},
	showView:function(){
		$(this.el).show();
	},
	toggleBookedSeat:function(event){
		var id=event.currentTarget.id;
		if($("#"+id).attr('src')=='img/empty-seat.png' && BookedSeats.length<$('#seats').val()){
			BookedSeats.push(id);
			$("#"+id).attr('src','img/booked-seat.png');

		}
		else if($("#"+id).attr('src')=='img/booked-seat.png'){
			BookedSeats=_.without(BookedSeats,_.findWhere(BookedSeats,id));
			$("#"+id).attr('src','img/empty-seat.png');
		}
	},
	updateTicketInfo:function(){
		var bookedSeats="";
		_.each(BookedSeats,function(bookedSeat){
			var row=Rows[parseInt(parseInt(bookedSeat)/12)];
			var column=parseInt(bookedSeat)%12;
			if(column==0){
				column=12;
			}
			if(_.indexOf(BookedSeats,bookedSeat)==BookedSeats.length-1){
				bookedSeats=bookedSeats+row+column;
			}
			else{
				bookedSeats=bookedSeats+row+column+",";
			}
		});
		$("#ticket-sold-info").append("<tr><td>"+$('#name').val()+"</td><td>"+$('#seats').val()+"</td><td>"+bookedSeats+"</td></tr>");
	},
	bookTickets:function(){
		if(BookedSeats.length==parseInt($('#seats').val())) {
			$(".requiredElements").text("");
			var reservedseats=JSON.parse(localStorage.getItem('ReservedSeats'))||[];
			_.each(BookedSeats,function(bookedSeat){
				reservedseats.push(bookedSeat);
			});
			var nameSeatsJSON=JSON.parse(localStorage.getItem('NameSeatsJSON'))||{};
			nameSeatsJSON[$('#name').val()]=BookedSeats;
			localStorage.setItem('NameSeatsJSON',JSON.stringify(nameSeatsJSON));
			localStorage.setItem('ReservedSeats',JSON.stringify(reservedseats));
			this.updateTicketInfo();
			window.location.reload();
		}
		else{
			$(".requiredElements").text("Please select exactly "+ $('#seats').val()+" seats");
		}
		
	},
});

var screenUI = new ScreenUI({el:$('.screen-ui')});
screenUI.hideView();

var TicketInfo=Backbone.View.extend({
	initialize:function(){
		var items=[];
		var json=JSON.parse(localStorage.getItem('NameSeatsJSON'));
		if(json!=null){
		_.each(json,function(key,value){
			var name=value;
			var number=key.length;
			var bookedSeats="";
			_.each(key,function(seat){
				var row=Rows[parseInt(parseInt(seat)/12)];
				var column=parseInt(seat)%12;
				if(column==0){
					column==12;
				}
				if(_.indexOf(key,seat)==key.length-1){
				bookedSeats=bookedSeats+row+column;
				}
				else{
					bookedSeats=bookedSeats+row+column+",";
				}
			});
			items.push({names:name,numbers:number,seats:bookedSeats});
		});
		var data={"items":items};
		var ticketInfoBody=_.template($("#table-ticket-info").html());
		$("#ticket-sold-info").html(ticketInfoBody(data));
		}
	}
});

var ticketInfo=new TicketInfo({el:$('.table-responsive')});
