// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import './interfaces/ISwapRouter.sol';

contract CoinmapDex is EIP712 {
    using SafeERC20 for IERC20;

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

    constructor(ISwapRouter _swapRouter) public EIP712('CoinmapDex', '1') {
        swapRouter = _swapRouter;
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
        IERC20(paths[0]).safeTransferFrom(order.maker, address(this), payAmount);
        IERC20(paths[0]).approve(address(swapRouter), payAmount);
        swapRouter.swapTokensForExactTokens(order.buyAmount, order.payAmount, paths, order.maker, order.deadline);

        makerSaltUsed[order.maker][order.salt] = true;
    }

    function cancelOrder(address maker, bytes32 salt) external {
        require(isValidSigner(maker, msg.sender));
        makerSaltUsed[maker][salt] = true;
    }

    function isValidSigner(address maker, address signer) public pure returns (bool) {
        return signer == maker;
    }
}
