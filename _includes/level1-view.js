let whenDocumentReady = (f) => {
    /in/.test(document.readyState) ? setTimeout('whenDocumentReady(' + f + ')', 9) : f()
}

let propertydetails = "";
let propertycontracts = ""; //get owner info
let propertyrentals = "";
let propertyowners = "";
let propId = 1;
let url = "";

whenDocumentReady(isReady = () => {
    document.getElementById('showBody').classList.remove('d-none')

    let formatCurencyBaht = (code) => {
        const formatter = new Intl.NumberFormat('th-TH', {
        style: 'currency',
        currency: 'THB',
        minimumFractionDigits: 2
      })
      let currency = formatter.format(code)
      return(currency)
    }

    let addTableRow = (name, value, table) => {
        table = table + `<tr><th scope="row">${name}:</th><td>${value}</td></tr>`
        return (table)
    }

    let ownersDone = (res) => {


        res = JSON.parse(res);
        propertyowners = res;
        //console.log(propertycontracts);
        //console.log(propertycontracts.proptery_owners.length);

        //get the datatable
        let table = `<table class="table">`
        table = addTableRow("Name", propertydetails.Name, table);
        table = addTableRow("Cost", propertydetails.Property_local_cost, table);
        table = addTableRow("Taxes", propertydetails.Property_taxes, table);
        table = addTableRow("Currency", propertydetails.property_local_currency.currency_type, table);
        table = addTableRow("Contract", `<a href="${propertydetails.property_token.contract_address}" target="_blank">
            ${propertydetails.property_token.contract_address}</a>`, table);
        table = table + "</table>";
        let theTable = document.getElementById("property-table");
        theTable.innerHTML = table;


        //rental aggrement 
        //todo : make this a datatable.   
        document.getElementById("rental-aggrement-table-id").innerHTML = propertydetails.rental_agreement.id;
        document.getElementById("rental-aggrement-table-name").innerHTML = propertydetails.rental_agreement.name;
        document.getElementById("rental-aggrement-table-rental_amount").innerHTML = propertydetails.rental_agreement.rental_amount;
        document.getElementById("rental-aggrement-table-deposit").innerHTML = propertydetails.rental_agreement.deposit;
        document.getElementById("rental-aggrement-table-start_date").innerHTML = propertydetails.rental_agreement.start_date;
        document.getElementById("rental-aggrement-table-end_date").innerHTML = propertydetails.rental_agreement.end_date;
        document.getElementById("rental-aggrement-table-yes").innerHTML = "Yes";

        //get the owners table
        let tableEl = $('#ownerstable').DataTable();
        let item;
        //loop the owners
        for (var i = 0; i < propertycontracts.proptery_owners.length; ++i) {
            //get the item
            item = propertycontracts.proptery_owners[i];
            //work out how many shares they have.
            let share = item.token_amount / propertydetails.Property_local_cost * 100
            //add the row.
            tableEl.row.add([item.name, item.email, item.token_amount, share]).draw(false);
        }

        //get the paid in table
        tableEl = $('#paidintable').DataTable();
        //set the paid in 
        let totalPaidIn = 0;
        //set the amount
        let amount = 0;
        //loop the data
        for (var i = 0; i < propertyrentals.rental_payments.length; ++i) {
            //set the item
            item = propertyrentals.rental_payments[i];
            //check the currency 
            //todo : we have to format all curriences not just baht  
            if (item.currency == "3")
                amount = formatCurencyBaht(item.amount)
            //store the table
            totalPaidIn = totalPaidIn+item.amount;
            //add the table row
            tableEl.row.add(["Rental payment", "rent", item.payment_date, amount]).draw(false);


        }
        //update the total
        document.getElementById("paidintotal").innerHTML = formatCurencyBaht(totalPaidIn);

        //get the paid in table
        tableEl = $('#paidouttable').DataTable();
        //set the paid out
        let totalPaidOut = 0;
        //set the amount
        amount = 0;
        //loop the data
        for (var i = 0; i < propertyrentals.rental_costs.length; ++i) {
            //set the item
            item = propertyrentals.rental_costs[i];
            //console.log(item)
            //check the currency 
            //todo : we have to format all curriences not just baht  
            if (item.currency == "3")
                amount = formatCurencyBaht(item.amount)
            //store the table
            totalPaidOut = totalPaidOut+item.amount;
            //add the table row
            tableEl.row.add(["Rental cost", item.description, item.date, amount]).draw(false);


        }
        //update the total
        document.getElementById("paidouttotal").innerHTML = formatCurencyBaht(totalPaidOut);


        //get the  distributions table
        tableEl = $('#disttable').DataTable();
        //set the paid out
        totalPaid = 0;
        let totaldist = 0;
        let totalcost = totalPaidIn - totalPaidOut;
        //set the amount
        amount = 0;
        //console.log(propertyowners)
        //loop the data
        for (var i = 0; i < propertyowners.length; ++i) {
            //set the item
            item = propertyowners[i];
            totalcost = totalcost - item.amount;
            totaldist = totaldist + item.amount;
            console.log(item)
            //check the currency 
            //todo : we have to format all curriences not just baht  
            if (item.currency.id == "3")
                amount = formatCurencyBaht(item.amount)
            else
                amount = `${item.currency.currency_type}${item.amount}`
            //store the table
            totalPaid = totalPaid+item.amount;
            //add the table row
            tableEl.row.add([item.proptery_owner.name, item.name, item.datepaid,amount,]).draw(false);


        }
        //update the total
        //todo : if we have various payment currencies could be hard to show a total here, have to think about this one.
        document.getElementById("totaldist").innerHTML = totaldist;
        document.getElementById("totalleft").innerHTML = totalcost;
        //show it
        document.getElementById("propertydiv").classList.remove("d-none");
    }


    let rentalsDone = (res) => {
        res = JSON.parse(res);
        propertyrentals = res;
        //console.log(propetyrentals)
        url = adminUrl + `property-owner-payments/?rental_agreement=${propertydetails.rental_agreement.id}`
        xhrcall(1, url, "", "json", "", ownersDone, "")
    }

    let contractsDone = (res) => {
        res = JSON.parse(res);
        propertycontracts = res;
        //console.log(propertycontracts)
        url = adminUrl + `rental-agreements/${propertydetails.rental_agreement.id}`
        xhrcall(1, url, "", "json", "", rentalsDone, "")
    }

    //get the main property details
    let propertyDone = (res) => {
        res = JSON.parse(res);
        for (var i = 0; i < res.length; ++i) {
            if (propId == res[i].id); {
                propertydetails = res[i];
                //console.log(propertydetails)
                url = adminUrl + `property-contracts/${propertydetails.rental_agreement.id}`
                xhrcall(1, url, "", "json", "", contractsDone, "")
            }
        }
    }
    url = adminUrl + "property-details/"
    xhrcall(1, url, "", "json", "", propertyDone, "")



})