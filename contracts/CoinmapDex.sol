// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import './interfaces/ISwapRouter.sol';

contract CoinmapDex is EIP712 {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    enum OrderStatus {NEW, FILLED, CANCELED}

    struct Order {
        address maker;
        address payToken;
        address buyToken;
        uint256 payAmount;
        uint256 buyAmount;
        uint256 deadline;
        bytes32 salt;
    }

    bytes32 public constant ORDER_TYPEHASH = keccak256(
        'Order(address maker,address payToken,address buyToken,uint256 payAmount,uint256 buyAmount,uint256 deadline,bytes32 salt)'
    );

    ISwapRouter public swapRouter;
    mapping(address => mapping(bytes32 => bool)) public makerSaltUsed;
    address public feeTo;

    event UpdateStatus(address indexed maker, bytes32 salt, OrderStatus status);

    constructor(ISwapRouter _swapRouter, address _feeTo) public EIP712('CoinmapDex', '1') {
        swapRouter = _swapRouter;
        feeTo = _feeTo;
    }

    function hashOrder(Order memory order) public pure returns (bytes32) {
        return keccak256(abi.encode(ORDER_TYPEHASH, order));
    }

    function verify(
        address signer,
        Order memory order,
        bytes memory signature
    ) public view returns (bool) {
        bytes32 digest = _hashTypedDataV4(hashOrder(order));
        return signer == ECDSA.recover(digest, signature);
    }

    function executeOrder(
        address signer,
        Order memory order,
        bytes memory signature,
        address[] memory paths
    ) external {
        require(isValidSigner(order.maker, signer));
        require(verify(signer, order, signature));
        require(paths[0] == order.payToken);
        require(paths[paths.length - 1] == order.buyToken);

        uint256 payAmount = swapRouter.getAmountsIn(order.buyAmount, paths)[0];
        require(payAmount <= order.payAmount, 'Current price too high');
        IERC20(paths[0]).safeTransferFrom(order.maker, address(this), payAmount);
        IERC20(paths[0]).approve(address(swapRouter), payAmount);
        uint256[] memory amounts = swapRouter.swapTokensForExactTokens(
            order.buyAmount,
            order.payAmount,
            paths,
            order.maker,
            order.deadline
        );
        require(amounts[amounts.length - 1] >= order.buyAmount, 'Receive amount is less than expected');
        IERC20(paths[0]).safeTransferFrom(order.maker, feeTo, order.payAmount.sub(payAmount));

        makerSaltUsed[order.maker][order.salt] = true;
        emit UpdateStatus(order.maker, order.salt, OrderStatus.FILLED);
    }

    function cancelOrder(address maker, bytes32 salt) external {
        require(isValidSigner(maker, msg.sender));
        makerSaltUsed[maker][salt] = true;
        emit UpdateStatus(maker, salt, OrderStatus.CANCELED);
    }

    function isValidSigner(address maker, address signer) public pure returns (bool) {
        return signer == maker;
    }
}
