pragma solidity ^0.4.11;

contract Skeleton {

  address public owner;

  event Deposit(address _sender, uint _value, bytes _message);
  event Sent(address indexed _receiver, uint _value);

  // Constrctor function
  function Skeleton() payable public {
    owner = msg.sender;
    Deposit(owner, msg.value, msg.data);
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
    if (msg.value == 0) revert();
    Deposit(msg.sender, msg.value, msg.data);
  }
}
