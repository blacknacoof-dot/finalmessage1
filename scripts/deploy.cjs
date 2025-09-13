const hre = require("hardhat");

async function main() {
  console.log("🚀 FinalMessage 스마트 컨트랙트 배포를 시작합니다...");

  // 컨트랙트 컴파일 확인
  await hre.run('compile');

  // 배포자 정보
  const [deployer] = await hre.ethers.getSigners();
  console.log("📋 배포자 주소:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("💰 배포자 잔액:", hre.ethers.formatEther(balance), "MATIC");

  // 컨트랙트 배포
  const FinalMessageContract = await hre.ethers.getContractFactory("FinalMessageContract");
  console.log("📄 컨트랙트 배포 중...");

  const contract = await FinalMessageContract.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ FinalMessageContract 배포 완료!");
  console.log("📍 컨트랙트 주소:", contractAddress);

  // 네트워크 정보
  const network = await hre.ethers.provider.getNetwork();
  console.log("🌐 네트워크:", network.name, `(Chain ID: ${network.chainId})`);

  // 트랜잭션 정보
  console.log("🔗 배포 트랜잭션:", contract.deploymentTransaction().hash);

  // Polygon Explorer 링크
  if (network.chainId === 80001n) {
    console.log("🔍 Mumbai PolygonScan:", `https://mumbai.polygonscan.com/address/${contractAddress}`);
  } else if (network.chainId === 137n) {
    console.log("🔍 PolygonScan:", `https://polygonscan.com/address/${contractAddress}`);
  }

  // 컨트랙트 검증 (선택사항)
  if (network.chainId !== 31337n) { // 로컬이 아닌 경우
    console.log("⏳ 블록 확인 대기 중...");
    await contract.deploymentTransaction().wait(6); // 6블록 대기

    console.log("🔍 컨트랙트 검증 중...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ 컨트랙트 검증 완료!");
    } catch (error) {
      console.log("⚠️ 컨트랙트 검증 실패:", error.message);
    }
  }

  // 환경 변수 파일 업데이트용 정보
  console.log("\n📝 환경 변수 설정:");
  console.log(`VITE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`VITE_CHAIN_ID=${network.chainId}`);

  // 테스트 실행
  console.log("\n🧪 기본 기능 테스트...");
  try {
    // 메시지 해시 저장 테스트
    const testHash = "0x1234567890abcdef1234567890abcdef12345678";
    const tx = await contract.storeMessageHash(testHash);
    await tx.wait();
    
    // 저장된 해시 조회
    const storedHash = await contract.getMessageHash(deployer.address);
    console.log("✅ 테스트 성공 - 저장된 해시:", storedHash);
    
  } catch (error) {
    console.log("⚠️ 테스트 실패:", error.message);
  }

  console.log("\n🎉 배포 완료!");
}

// 에러 처리
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 배포 실패:", error);
    process.exit(1);
  });