1단계: MongoDB Atlas에서 VPC 피어링 설정

MongoDB Atlas 콘솔 접속: MongoDB Atlas 웹사이트에 로그인하여 프로젝트를 선택합니다.

Security 탭에서 Network Peering을 선택합니다.

AWS를 선택하고 Add Peering Connection 버튼을 클릭합니다.

피어링 연결 구성:

Connection Name: 연결 이름을 지정합니다.
Cloud Provider Region: AWS 리전을 선택합니다. (예: us-east-1)
AWS Account ID: AWS 계정 ID를 입력합니다.
VPC ID: 피어링할 AWS VPC의 ID를 입력합니다.
Atlas CIDR Block: MongoDB Atlas에서 사용할 CIDR 블록을 지정합니다. (예: 192.168.0.0/16) 이 CIDR 블록은 AWS VPC의 CIDR 블록과 겹치지 않아야 합니다.
Route tables: VPC 피어링 연결을 추가할 라우팅 테이블을 선택합니다. 각 라우팅 테이블에 대해 MongoDB Atlas CIDR 블록을 지정합니다.

Create Peering Connection 버튼을 클릭하여 VPC 피어링 연결을 생성합니다.

2단계: AWS에서 VPC 피어링 연결 수락

AWS 콘솔 접속: AWS Management Console에 로그인하여 VPC 서비스로 이동합니다.

Peering connections를 선택합니다.

MongoDB Atlas에서 생성한 VPC 피어링 연결 요청을 찾습니다.

Actions 버튼을 클릭하고 Accept Request를 선택합니다.

Accept Request 버튼을 클릭하여 VPC 피어링 연결 요청을 수락합니다.

3단계: 라우팅 테이블 설정

MongoDB Atlas 콘솔: MongoDB Atlas 콘솔에서 VPC 피어링 연결의 상태가 "Available"인지 확인합니다. "Available" 상태가 아니면 몇 분 정도 기다린 후 다시 확인합니다.

AWS 콘솔: AWS 콘솔에서 VPC 피어링 연결이 "Active" 상태인지 확인합니다.

라우팅 테이블 업데이트: AWS VPC의 라우팅 테이블에 MongoDB Atlas VPC의 CIDR 블록으로 향하는 트래픽을 VPC 피어링 연결로 라우팅하는 규칙을 추가합니다.

4단계: 보안 그룹 설정

AWS 콘솔: AWS 콘솔에서 EC2 인스턴스 또는 다른 AWS 리소스에 대한 보안 그룹을 편집합니다.

인바운드 규칙: MongoDB Atlas VPC의 CIDR 블록에서 오는 트래픽을 허용하는 인바운드 규칙을 추가합니다. 필요한 포트 (예: MongoDB 기본 포트 27017)을 열어야 합니다.

아웃바운드 규칙: MongoDB Atlas VPC의 CIDR 블록으로 향하는 트래픽을 허용하는 아웃바운드 규칙을 추가합니다.

VPC 피어링이 완료되었습니다! 이제 AWS 리소스에서 MongoDB Atlas 클러스터에 안전하게 연결할 수 있습니다.
