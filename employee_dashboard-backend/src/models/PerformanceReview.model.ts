import { Model, DataTypes, Sequelize, Optional } from 'sequelize';

export interface PerformanceReviewAttributes {
  id: number;
  employee_id: number;
  reviewer_id: number;
  review_period: string;
  rating: number;
  goals_achieved?: string | null;
  strengths?: string | null;
  areas_for_improvement?: string | null;
  comments?: string | null;
  status: 'Draft' | 'Completed' | 'Acknowledged';
  review_date: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PerformanceReviewCreationAttributes = Optional<
  PerformanceReviewAttributes,
  'id' | 'goals_achieved' | 'strengths' | 'areas_for_improvement' | 'comments' | 'status'
>;

export class PerformanceReview
  extends Model<PerformanceReviewAttributes, PerformanceReviewCreationAttributes>
  implements PerformanceReviewAttributes
{
  public id!: number;
  public employee_id!: number;
  public reviewer_id!: number;
  public review_period!: string;
  public rating!: number;
  public goals_achieved?: string | null;
  public strengths?: string | null;
  public areas_for_improvement?: string | null;
  public comments?: string | null;
  public status!: 'Draft' | 'Completed' | 'Acknowledged';
  public review_date!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initModel(sequelize: Sequelize): typeof PerformanceReview {
    PerformanceReview.init(
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        employee_id: { type: DataTypes.BIGINT, allowNull: false },
        reviewer_id: { type: DataTypes.INTEGER, allowNull: false },
        review_period: { type: DataTypes.STRING(80), allowNull: false },
        rating: { type: DataTypes.DECIMAL(3, 1), allowNull: false },
        goals_achieved: { type: DataTypes.TEXT, allowNull: true },
        strengths: { type: DataTypes.TEXT, allowNull: true },
        areas_for_improvement: { type: DataTypes.TEXT, allowNull: true },
        comments: { type: DataTypes.TEXT, allowNull: true },
        status: {
          type: DataTypes.ENUM('Draft', 'Completed', 'Acknowledged'),
          allowNull: false,
          defaultValue: 'Completed',
        },
        review_date: { type: DataTypes.DATEONLY, allowNull: false },
      },
      { sequelize, tableName: 'performance_reviews', timestamps: true }
    );
    return PerformanceReview;
  }
}

export default PerformanceReview;
