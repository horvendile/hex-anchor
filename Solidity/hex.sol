pragma solidity ^0.4.11;

contract HEX {

    address public owner;

    uint counter;
    uint dieRoll;
    uint pot;
    uint[] hit;
    uint i;

//    event Deposit(address _sender, uint _value, uint _stake, bytes _message);
    event Sent(address indexed _receiver, uint _value);
    event HashSource(uint _hs);

    // Constrctor function
    function HEX() payable public {
        owner = msg.sender;
        pot = msg.value;
    }


    function transferPayment(uint payment, address recipient) internal {
        recipient.transfer(payment);
        Sent(recipient, payment);
    }

    function withdraw(uint _amount) public {
        if (msg.sender==owner)
        transferPayment(_amount, owner);
    }

    function kill() public {
         if (msg.sender==owner)
         selfdestruct(owner);
    }


    function() public payable {

        // Calculate and test stakes
        {

            if (msg.value == 0) revert();

            uint stakeCount = 0;
            for ( i = 0 ; i < 16 ; i++ ) {
                stakeCount += uint(msg.data[i]);
            }

            uint singleStake = msg.value / stakeCount;

            if (singleStake > pot/10) revert();

//            Deposit(msg.sender, msg.value, singleStake, msg.data);
        }

        hit = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

        counter = counter + 1;

        uint sh = uint(keccak256(block.number,block.blockhash(block.number-1), block.timestamp,counter,msg.sender,msg.value,msg.data));
        HashSource( sh );

        uint total = 0;
        uint hitTotal = 0;
        for ( i = 0; i < 8; i++) {
            dieRoll = sh % 16;
            sh = sh / 16;

            if (uint(msg.data[dieRoll]) == 1) {
                if (hit[dieRoll] == 0 ) {
                    hit[dieRoll] = 1;
                    hitTotal++;
                }
            total++;
            }

        }
        total += hitTotal;
        uint payout = total * singleStake;
        transferPayment(payout, msg.sender);
        pot = address(this).balance;
    }
}
