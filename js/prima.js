var BookedSeats = [];
var Rows=["A","B","C","D","E","F","G","H","I","J"];
var Columns=12;
var TotalSeats=Rows.length*Columns;

function convertIntToSeatNumbers(seats){
	var bookedSeats="";
	_.each(seats,function(seat){
		var row=Rows[parseInt(parseInt(seat)/12)];
		var column=parseInt(seat)%12;
		if(column==0){
			column=12;
		}
		if(_.indexOf(seats,seat)==seats.length-1){
			bookedSeats=bookedSeats+row+column;
		}
		else{
			bookedSeats=bookedSeats+row+column+",";
		}
	});
	return bookedSeats;
}

var InitialView = Backbone.View.extend({
	events:{
		"click #submitSelection": "submitForm"
	},
	submitForm : function(){
		var reservedseats=JSON.parse(localStorage.getItem('ReservedSeats'));
		var availableSeats=TotalSeats;
		var selectedNumberOfSeats=$('#seats').val();
		if(reservedseats!=null)
			availableSeats=TotalSeats-reservedseats.length;
		if(!$('#name').val()){
			$(".error").html("Name is required");
		}
		else if(!selectedNumberOfSeats){
			$(".error").html("Number of seats is required");
		}
		else if(parseInt(selectedNumberOfSeats)>availableSeats){
			$(".error").html("You can only select "+availableSeats+" seats")
		}
		else
		{
			$(".error").html("");
			screenUI.showView();
		}
	}
});
var initialView = new InitialView({el:$('.selectionForm')});

var ScreenUI=Backbone.View.extend({
	events:{
		"click .empty-seat,.booked-seat":"toggleBookedSeat",
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
		var id="#"+event.currentTarget.id;
		if($(id).attr('class')=='empty-seat' && BookedSeats.length<$('#seats').val()){
			BookedSeats.push(id.substr(1));
			$(id).attr('src','img/booked-seat.png');
			$(id).attr('class','booked-seat');

		}
		else if($(id).attr('class')=='booked-seat'){
			BookedSeats=_.without(BookedSeats,id.substr(1));
			$(id).attr('src','img/empty-seat.png');
			$(id).attr('class','empty-seat');
		}
	},
	updateTicketInfo:function(){
		var bookedSeats=convertIntToSeatNumbers(BookedSeats);
		$("#ticket-sold-info").append("<tr><td>"+$('#name').val()+"</td><td>"+$('#seats').val()+"</td><td>"+bookedSeats+"</td></tr>");
	},
	bookTickets:function(){
		if(BookedSeats.length==parseInt($('#seats').val())) {
			$(".error").text("");
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
			$(".error").html("Please select exactly "+ $('#seats').val()+" seats");
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
			var bookedSeats=convertIntToSeatNumbers(key);
			items.push({names:name,numbers:number,seats:bookedSeats});
		});
		var data={"items":items};
		var ticketInfoBody=_.template($("#table-ticket-info").html());
		$("#ticket-sold-info").html(ticketInfoBody(data));
		}
	}
});

var ticketInfo=new TicketInfo({el:$('.table-responsive')});
