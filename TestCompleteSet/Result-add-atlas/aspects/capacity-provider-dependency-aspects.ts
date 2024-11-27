import * as cdk from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { IConstruct } from 'constructs'; 

export interface CapacityProviderDependencyAspectProps {
    // Add any optional properties here if needed
  }
  
  export class CapacityProviderDependencyAspect implements cdk.IAspect {
    constructor(private readonly props?: CapacityProviderDependencyAspectProps) {}
  
    public visit(node: IConstruct): void {
        if (node instanceof ecs.Ec2Service) {
          const children = node.cluster.node.findAll();
          for (const child of children) {
            if (child instanceof ecs.CfnClusterCapacityProviderAssociations) {
              child.node.addDependency(node.cluster);
              node.node.addDependency(child);
          }
        }
      }
    }
  }
