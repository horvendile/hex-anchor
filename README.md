<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>HΞX</title>
    <meta name="ethereum-dapp-url-bar-style" content="transparent">
    <link rel="shortcut icon" href="tiara.png" type="image/vnd.microsoft.icon">
    <link rel='stylesheet' href='anchor.css' type='text/css'>
    <script src="web3.js"></script>
    <link href="https://fonts.googleapis.com/css?family=Anonymous+Pro" rel="stylesheet">

    <script> //INITIAL SETUP

      var mainAccount, contractAddress, web3, bal , tHash , maxWager;

      var targetAddress = "0x300432bA68574DABB8872B7DE90CE84dde861b8c";
      var gas = 20*10**9

    </script>

    <script> // Functions
      // FUNCTION IS EXECUTED ON PAGE LOAD
      function init() {
        //  document.getElementById("message").textContent = messageString;
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

        // Check if there are available accounts

        /*// Checks Web3 support
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
        document.getElementById("leftHash").innerHTML = "<marquee>Waiting for block to be mined</marquee>";
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
        for (i=0;i<8;i++) {
        document.getElementById("roll"+i).textContent = "";
        }
      }

    </script>

    <script> // Numbers Scripts
      var hexArray = ["0","1","2","3","4","5","6","7","8","9","A","B","C","Đ","Ξ","F"]
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
//          alert("Wager exceeds maximum");
          wagerOverflow()
          bet.value = maxWager;
          return;
        }
        adjustedTotal = Math.round(total*bet.value*1000)/1000;
        document.getElementById('totalBets').textContent = adjustedTotal;
      }

      var overFlowHTML = "Overflow"+
      "<button style = 'bottom:20px; right:20px; position:absolute' onclick='hidePanel()'>OK</button>";
      function wagerOverflow() {
        document.getElementById("panel").innerHTML = overFlowHTML;
        document.getElementById("panel").style.backgroundColor = "pink";
        document.getElementById("panel").style.width = "300px";
        document.getElementById("panel").style.height = "200px";
        showPanel();
      }



    </script>

  </head>
  <body>
    <canvas class="background"></canvas>
    <div class="flex-container" >
      <table id="inner">
        <tr> <!-- Header and Info Table-->
          <td>
            <div id="header" >
              HΞX
            </div>
          </td>
          <td>
            <table id="infoTable">
              <tr>
                <td class="infoLabel">
                  Player :
                </td>
                <td class="infoContent" >
                  <span id="ma">
                    Unable to connect to Main Account
                  </span>
                </td>
              </tr>
              <tr>
                <td class="infoLabel">
                   Balance :
                </td>
                <td class="infoContent" >
                  <span style = 'width: 20px' id="ba"></span> Ξther
                </td>
              </tr>
              <tr id="filler">
              </tr>
              <tr>
                <td class="infoLabel">
                  Contract  :
                </td>
                <td class="infoContent" >
                  <span id="ca"></span>
                </td>
              </tr>
              <tr>
                <td class="infoLabel">
                   Balance :
                </td>
                <td class="infoContent" >
                  <span id="cb"></span> Ξther
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr> <!-- Hash Source -->
          <td colspan="2" id="hashSource">
            <span id="leftHash"></span><span id="rightHash"></span>
          </td>
        </tr>
        <tr> <!-- Buttons -->
          <td><!-- Button Table -->
            <div>
              <table id="buttonTable" >
                <tr class="buttonRow">
                  <td class="buttonCell" onclick="toggle(0)" id="buttonCell0">0</td>
                  <td class="buttonCell" onclick="toggle(1)" id="buttonCell1">1</td>
                  <td class="buttonCell" onclick="toggle(2)" id="buttonCell2">2</td>
                  <td class="buttonCell" onclick="toggle(3)" id="buttonCell3">3</td>
                </tr>
                <tr class="buttonRow">
                  <td class="buttonCell" onclick="toggle(4)" id="buttonCell4">4</td>
                  <td class="buttonCell" onclick="toggle(5)" id="buttonCell5">5</td>
                  <td class="buttonCell" onclick="toggle(6)" id="buttonCell6">6</td>
                  <td class="buttonCell" onclick="toggle(7)" id="buttonCell7">7</td>
                </tr>
                <tr class="buttonRow">
                  <td class="buttonCell" onclick="toggle(8)" id="buttonCell8">8</td>
                  <td class="buttonCell" onclick="toggle(9)" id="buttonCell9">9</td>
                  <td class="buttonCell" onclick="toggle(10)" id="buttonCell10">A</td>
                  <td class="buttonCell" onclick="toggle(11)" id="buttonCell11">B</td>
                </tr>
                <tr class="buttonRow">
                  <td class="buttonCell" onclick="toggle(12)" id="buttonCell12">C</td>
                  <td class="buttonCell" onclick="toggle(13)" id="buttonCell13">D</td>
                  <td class="buttonCell" onclick="toggle(14)" id="buttonCell14">E</td>
                  <td class="buttonCell" onclick="toggle(15)" id="buttonCell15">F</td>
                </tr>
                <tr class="buttonRow">
                  <td colspan="4" class="buttonCell" onclick="clearButtons()" id="buttonCell12">Clear</td>
                </tr>
              </table>
            </div>
          </td>
          <td id="rollHolder">
            <div><!--Rolls-->
              <table id="rollTable">
                <tr>
                  <td class="rollCell" id=roll0>0</td>
                  <td class="rollCell" id=roll1>0</td>
                  <td class="rollCell" id=roll2>0</td>
                  <td class="rollCell" id=roll3>0</td>
                  <td class="rollCell" id=roll4>0</td>
                  <td class="rollCell" id=roll5>0</td>
                  <td class="rollCell" id=roll6>0</td>
                  <td class="rollCell" id=roll7>0</td>
                </tr>
              </table>
            </div>

            <div style="font-size:100%; font-style: arial"><!--Wagers>-->
              <table>
                <tr>
                  <td>
                    Maximimum Wager = <span id="mw" />
                  </td>
                  <td>
                    Wager :
                    <input
                    onchange = "updateTotal()"
                    style = "font-size : 100%; padding:5px"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="1"
                    id="bet"
                    name="bet"
                    value="0.10"
                    >
                  </td>
                  <td>
                    Total = <span id=totalBets>0</span>
                  </td>
                </tr>
              </table>
            </div>

            <div><!--Press Here-->
              <table>
                <tr>
                  <td>
                    <button onclick = "submitTransaction(targetAddress, adjustedTotal*10**18, messageString)" >
                      Place Wagers
                    </button>
                  </td>
                    <!--<td>
                      <span id="message"></span>
                    </td> -->
                </tr>
              </table>
            </div>
            <div id="payOut"></div>
            <div id="transactionAddress"></div>
          </td>
        </tr>
      </table>
    </table>
    <div id="panel">
      <div id='closeButton' onclick='hidePanel()'>x</div>
      <script>// Panels
        var flash1="<div id='closeButton' onclick='hidePanel()'>x</div>"
        +"<p style='font-size:40px'>Welcome to HΞX</p>"
        +"<p>HΞX is an opportunity to wager on hashed hexadecimal digits.</p><p>You select the hex numbers that will appear in the last eight digits of a cryptographic hash, generated by a smart contract.</p><p>If one of your chosen numbers appears, you get back your stake plus the same again for each appearance. </p><p>For example, if you wager 0.1ETH on the number 8, and the last eight digits of the hash are 8182D833, you will get back 0.4ETH; 0.1ETH for the original stake and 0.3ETH for the three times that the number 8 appears.</p><p>You can wager on as many of the numbers as you wish, up to a <span id='maximum' onclick='fillPanel(flash2)'>maximum</span> of 0.5ETH on each number.</p>";

        var flash2="<div id='closeButton' onclick='hidePanel()'>x</div><p>The maximum amount that you can wager on any digit is set at a level (currently 0.5ETH) that will ensure that the size of the pot will always cover the maximum possible pay out.</p><p>The smart contract uses a relatively simple, and transparent way to generate the hash. This can be seen in the Smart Contract at</p><p><center><a target='_blank' href='https://etherscan.io/address/0x59cd76b3f40091d9a9fd46cb726671113017ceab#code'>0x59cd76b3f40091d9a9fd46cb726671113017ceab</a></center></p><p>While this method could be subject to manipulation by Miners, the opportunity cost in doing so would  be such as to make attempted manipulation uneconomic. To ensure that this continues to be the case, the maximum wager will always be limited to 1.0ETH.</p>"
      </script>
    </div>
    <div id="browser">
      <p>You need to connect to the Ethereum Main Network, with Mist or the MetaMask extension in Chrome.</p>
    </div>
  </div>
  <canvas onclick="hidePanel()" class="background"></canvas>
  <script type="text/javascript"> // Load on opening
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
           maxParticles: 200,
           connectParticles: true,
           speed:1,
           sizeVariations:3,
         });

        }
    if (document.addEventListener) document.addEventListener("DOMContentLoaded", autorun, false);
    else if (document.attachEvent) document.attachEvent("onreadystatechange", autorun);
    else window.onload = autorun;
  </script>
  <script src="particles.js-master/dist/particles.min.js"></script>
</body>
</html>
