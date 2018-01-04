
var mainAccount , web3 , bal , tHash , maxWager;

var targetAddress = "0x300432bA68574DABB8872B7DE90CE84dde861b8c";
var gas = 20*10**9

function fillPanel(flash) {
  document.getElementById("panel").innerHTML = flash;
  showPanel();
}
function showPanel() {
  document.getElementById("panel").style.visibility = "visible";
}
function hidePanel() {
  document.getElementById("panel").style.visibility = "hidden";
  document.getElementById("inner").style.opacity = 1;
}
function autorun(){
  init();
  document.getElementById("leftHash").innerHTML = "<marquee>Ready to play</marquee>";
  document.getElementById("rightHash").textContent = "";
  fillPanel(flash1);
  showPanel();

  Particles.init({
    selector: '.background',
    color: '#75A5B7',
    maxParticles: 50,
    connectParticles: true,
    speed:1,
    sizeVariations:3,
  });

}

function init() { // FUNCTION IS EXECUTED ON PAGE LOAD
  // Checks Web3 support
  if(typeof web3 !== 'undefined' && typeof Web3 !== 'undefined') {
    // If there's a web3 library loaded, then make your own web3
    web3 = new Web3(web3.currentProvider);
    } else if (typeof Web3 !== 'undefined') {
      // If there isn't then set a provider
      web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    } else if(typeof web3 == 'undefined') {
      // If there is neither then this isn't an ethereum browser

      // browser.style.visibility = "visible";
      document.getElementById("browser").style.visibility = "visible";
      return;
  }

  /*// Check if there are available accounts

  // Checks Web3 support
  if (typeof web3 !== 'undefined') {
  // If there isn't then set a provider
  web3 = new Web3(web3.currentProvider);
  } else { // use Infura if it's not there
  web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/xb1hnXsk67Yb6pIlVPvv"));
  }
  */

  // Get user's ethereum account
  web3.eth.getAccounts(function(e,accounts){
    // show the floating baloon
    if (e || !accounts || accounts.length == 0) {
      document.getElementById("browser").style.visibility = "visible";
    } else {
      mainAccount = accounts[0];
      document.getElementById("ma").textContent = mainAccount.toUpperCase();
      document.getElementById("ca").textContent = targetAddress.toUpperCase();

      web3.eth.getBalance(mainAccount, function(e, accountBalance){
        if(!e) {
          var unformattedAccountBalance = Math.round(accountBalance/10**15)/1000
          document.getElementById("ba").textContent = unformattedAccountBalance.toFixed(3);
        }
      });
    }
  });

  web3.eth.getBalance(targetAddress, function(e, contractBalance) {
    if(!e) {
      var unformattedContractBalance = Math.round(contractBalance/10**15)/1000;
      maxWager = Math.floor(contractBalance/10**18)/10;
      if (maxWager > 1) maxWager = 1;

      document.getElementById("cb").textContent = unformattedContractBalance.toFixed(3);
      document.getElementById("mw").textContent = maxWager.toFixed(1);
    }
  });
}

function submitTransaction(_contractAddress , _value , _data) {
  document.getElementById("leftHash").innerHTML = "<marquee>Waiting for the block to be mined</marquee>";
  document.getElementById("rightHash").textContent = "";
  clearRolls();
  web3.eth.sendTransaction({to: _contractAddress, value: _value, data:_data, gasPrice: gas },
    function(err, transactionHash) {
      if(!err) {
        tHash = transactionHash;
        var filter = web3.eth.filter('latest')
        filter.watch(function(err, hash) {
          if (!err) {
            web3.eth.getBlock(hash, function(err,result) {
              if(!err) {
                var transactionArray = result.transactions;
                for ( i=0 ; i<transactionArray.length ; i++ ) {
                  if (transactionHash == transactionArray[i]) {
                    web3.eth.getTransactionReceipt(transactionHash,
                      function(err,transactionReceipt) {
                        if(!err) {
                          updateScreen(transactionReceipt);
                        }
                      });
                    }
                  };
                }
              })
            }
          });
        }
      })
    }

    function updateScreen(receipt) {
      var generatedHash = String(receipt.logs[0].data).toUpperCase();
      processHash(generatedHash);
      payout = receipt.logs[1].data / 10**18;
      payoutText = "You have won "+payout.toFixed(2)+" Ether"
      document.getElementById("payOut").textContent = payoutText;
      document.getElementById("payOut").style.visibility = "visible";
      transactionHTML = "<a href='https://rinkeby.etherscan.io/tx/"+tHash+"' target='_blank'>"+tHash+"</a>";
      document.getElementById("transactionAddress").innerHTML = transactionHTML;
      /*
      alert(receipt.logs[1].data.toUpperCase()+'\n\nYou have won: '+
      payout +
      ' Ξther\n\nFrom ')
      */
      init();
    }
    function processHash(h) {
      lh = h.substring(0,h.length-8);
      rh = h.substring(h.length-8,h.length);
      document.getElementById("leftHash").textContent = lh;
      document.getElementById("rightHash").textContent = rh;
      for (i=0;i<8;i++) {
        document.getElementById("roll"+i).textContent = h.substring(58+i,59+i);
      }
    }
    function clearRolls() {
      document.getElementById("rollTable").style.visibility = "visible";
      document.getElementById("rollTable").style.margin = "30px";
      for (i=0;i<8;i++) {
        document.getElementById("roll"+i).textContent = "";
      }
    }

    //var hexArray = ["0","1","2","3","4","5","6","7","8","9","A","B","C","Đ","Ξ","F"]
    var numbtns = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var bets = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var total = 0;
    var adjustedTotal = 0;
    var messageString = "0x00000000000000000000000000000000";

    function toggle(btn) {
      if (numbtns[btn]==0) {
        numbtns[btn] = 1;
        document.getElementById("buttonCell"+btn).style.borderStyle = "inset";
        document.getElementById("buttonCell"+btn).style.color = "red";
        total++ ;
      }
      else {
        numbtns[btn] = 0;
        document.getElementById("buttonCell"+btn).style.borderStyle = "outset";
        document.getElementById("buttonCell"+btn).style.color = "black";
        total-- ;
      }
      updateString();
      updateTotal();
    }
    function clearButtons() {
      for ( i=0; i<16 ; i++ ) {
        if ( numbtns[i] ==1 ) {
          toggle(i);
        }
      }
      updateString();
      updateTotal();
    }
    function oddButtons() {
      clearButtons();
      toggle(1);
      toggle(3);
      toggle(5);
      toggle(7);
      toggle(9);
      toggle(11);
      toggle(13);
      toggle(15);
    }
    function evenButtons() {
      clearButtons();
      toggle(2);
      toggle(4);
      toggle(6);
      toggle(8);
      toggle(10);
      toggle(12);
      toggle(14);
      toggle(0);
    }
    function primeButtons() {
      clearButtons();
      toggle(2);
      toggle(3);
      toggle(5);
      toggle(7);
      toggle(11);
      toggle(13);
    }

    function updateString(){
      messageString = "0x";
      for (x=0;x<16;x++) {
        messageString = messageString+"0"+numbtns[x];
      }
      //  document.getElementById("message").textContent = messageString;
    }

    function updateTotal(){
      if(bet.value>maxWager){
        wagerOverflow()
        bet.value = maxWager;
        return;
      }
      adjustedTotal = Math.round(total*bet.value*1000)/1000;
      document.getElementById('totalBets').textContent = adjustedTotal;
    }

    function wagerOverflow() {
      var overFlowHTML = "Overflow"+
      "<button style = 'bottom:20px; right:20px; position:absolute' onclick='hidePanel()'>OK</button>";
      document.getElementById("panel").innerHTML = overFlowHTML;
      document.getElementById("panel").style.backgroundColor = "pink";
      document.getElementById("panel").style.width = "300px";
      document.getElementById("panel").style.height = "200px";
      showPanel();
    }
