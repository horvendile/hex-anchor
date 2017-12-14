pragma solidity ^0.4.11;

contract Anchor {

    address public owner;

    uint counter;
    uint dieRoll;
    uint pot;
    bytes stakes;
    uint[] hit;
    uint i;
//--------------------------------------------------------------------------
    event Deposit(address _sender, uint _value, uint _stake, bytes _message);
    event Sent(address indexed _receiver, uint _value);
    event Stuff(uint _blockNumber, uint _timestamp, uint _digits, address _sender, uint _stake, bytes _message );
    event Score(uint _number);

    // Constrctor function
    function Anchor() payable public {
        owner = msg.sender;
        pot = msg.value;
        Deposit(owner, pot, 0, msg.data);
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

            uint totalStake = msg.value;
            stakes = msg.data;

            uint stakeCount = 0;
           for ( i = 0 ; i < 16 ; i++ ) {
               stakeCount += uint(stakes[i]);
           }

           uint singleStake = totalStake / stakeCount;

            if (singleStake > pot/10) revert();

            Deposit(msg.sender, totalStake, singleStake, msg.data);
        }

        address ms = msg.sender;


        hit = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

        counter = counter + 1;

        uint bn = block.number;
        uint bts = block.timestamp;
        uint sh = uint(keccak256(bn,block.blockhash(bn-1), bts,counter,ms,totalStake,msg.data));

        Stuff( bn, bts, sh, ms, totalStake, msg.data );

        uint total = 0;
        uint hitTotal = 0;
        for ( i = 0; i < 8; i++) {
            dieRoll = sh % 16;
            sh = sh / 16;

            if (uint(stakes[dieRoll]) == 1) {
                if (hit[dieRoll] == 0 ) {
                    hit[dieRoll] = 1;
                    hitTotal++;
                }
            total++;
            }

            Score(dieRoll);
        }
        total += hitTotal;
        uint payout = total * singleStake;
        transferPayment(payout, ms);
        pot = address(this).balance;
    }
}
