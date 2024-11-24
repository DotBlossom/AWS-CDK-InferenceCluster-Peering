    //---------------------------------------------------------------------------
    // VPC Peering

    // 가상의 VPC 생성 (10.0.0.0/16)
    const peerVpc = new ec2.Vpc(this, 'PeerVpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
    });

    // VPC Peering 연결 생성
    const vpcPeeringConnection = new ec2.CfnVPCPeeringConnection(this, 'VpcPeeringConnection', {
      peerVpcId: peerVpc.vpcId,
      vpcId: vpc.vpcId,
    });

    //---------------------------------------------------------------------------
    // Routing Tables

    // cdk-cluster-VPC의 라우팅 테이블에 PeerVpc로 향하는 경로 추가
    for (const subnet of vpc.privateSubnets) {
      subnet.routeTable.addRoute('PeerVpcRoute', {
        destinationCidrBlock: peerVpc.vpcCidrBlock,
        vpcPeeringConnectionId: vpcPeeringConnection.ref,
      });
    }

    // PeerVpc의 라우팅 테이블에 cdk-cluster-VPC로 향하는 경로 추가
    for (const subnet of peerVpc.privateSubnets) {
      subnet.routeTable.addRoute('CdkClusterVpcRoute', {
        destinationCidrBlock: vpc.vpcCidrBlock,
        vpcPeeringConnectionId: vpcPeeringConnection.ref,
      });
    }

    //---------------------------------------------------------------------------
    // Security Groups

    // PeerVpc에서 cdk-cluster-VPC의 ALB로의 접근을 허용하는 보안 그룹
    const peerVpcSecurityGroup = new ec2.SecurityGroup(this, 'PeerVpcSecurityGroup', {
      vpc: peerVpc,
      description: 'Allow access from PeerVpc to ALB',
      allowAllOutbound: true,
    });
    peerVpcSecurityGroup.addIngressRule(ec2.Peer.ipv4(peerVpc.vpcCidrBlock), ec2.Port.tcp(80), 'Allow HTTP access from PeerVpc');

    // cdk-cluster-VPC의 ALB 보안 그룹에 PeerVpc에서의 접근을 허용
    const albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc: vpc,
      description: 'Allow access to ALB',
      allowAllOutbound: true,
    });
    albSecurityGroup.addIngressRule(ec2.Peer.ipv4(peerVpc.vpcCidrBlock), ec2.Port.tcp(80), 'Allow HTTP access from PeerVpc');

