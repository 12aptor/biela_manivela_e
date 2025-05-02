import { create, all } from "mathjs";

const math = create(all);

interface BielaManivelaParams {
  Lm: number;
  Lb: number;
  e: number;
  theta_m_deg: number;
  theta_b_deg: number;
  s: number;
  vel_m: number;
  vel_b: number;
  vel_s: number;
  acc_m: number;
  acc_b: number;
  acc_s: number;
}

export class BielaManivela {
  public theta_m_rad: number;
  public theta_b_rad: number;
  public s: number;
  public vel_m: number;
  public vel_b: number;
  public vel_s: number;
  public acc_m: number;
  public acc_b: number;
  public acc_s: number;

  constructor(private params: BielaManivelaParams) {
    this.theta_m_rad = (params.theta_m_deg * math.pi) / 180;
    this.theta_b_rad = (params.theta_b_deg * math.pi) / 180;
    this.s = params.s;
    this.vel_m = params.vel_m;
    this.vel_b = params.vel_b;
    this.vel_s = params.vel_s;
    this.acc_m = params.acc_m;
    this.acc_b = params.acc_b;
    this.acc_s = params.acc_s;
  }

  calculatePosition() {
    this.s =
      this.params.Lm * math.cos(this.theta_m_rad) +
      this.params.Lb * math.sin(this.theta_b_rad);
    return this.s;
  }

  equationOfMotion() {
    if (this.params.theta_m_deg) {
      const dividend = math.add(
        math.multiply(this.params.Lm, math.sin(this.theta_m_rad)),
        this.params.e
      );
      const divisor = this.params.Lb;
      const asin_argument = dividend / divisor;

      this.theta_b_rad = math.asin(asin_argument) as number;
      this.calculatePosition();

      return {
        theta_m_deg: this.params.theta_m_deg,
        theta_b_deg: (this.theta_b_rad * 180) / math.pi,
        s: this.s,
      };
    }

    if (this.params.theta_b_deg) {
      const dividend = math.subtract(
        math.multiply(this.params.Lb, math.sin(this.theta_b_rad)),
        this.params.e
      );
      const divisor = this.params.Lm;

      this.theta_m_rad = math.asin(dividend / divisor) as number;
      this.calculatePosition();

      return {
        theta_m_deg: (this.theta_m_rad * 180) / math.pi,
        theta_b_deg: this.params.theta_b_deg,
        s: this.s,
      };
    }

    if (this.params.s) {
      const acos_dividend = math.add(
        math.add(math.pow(this.params.s, 2), math.pow(this.params.e, 2)),
        math.subtract(math.pow(this.params.Lb, 2), math.pow(this.params.Lm, 2))
      );
      const acos_divisor = math.multiply(2, this.params.Lb);
      const acos_argument = math.divide(acos_dividend, acos_divisor) as number;
      this.theta_b_rad = math.add(
        math.atan(math.divide(this.params.e, this.params.s)),
        math.acos(acos_argument)
      ) as number;

      console.log({
        acos_dividend: acos_dividend,
        acos_divisor: acos_divisor,
        acos_argument: acos_argument,
        theta_b_rad: this.theta_b_rad,
      })

      const asin_dividend = math.subtract(
        math.multiply(this.params.Lb, math.sin(this.theta_b_rad)),
        this.params.e
      );
      const asin_divisor = this.params.Lm;

      this.theta_m_rad = math.asin(asin_dividend / asin_divisor) as number;

      console.log({
        asin_dividend: asin_dividend,
        asin_divisor: asin_divisor,
        theta_m_rad: this.theta_m_rad,
      })

      return {
        theta_m_deg: (this.theta_m_rad * 180) / math.pi,
        theta_b_deg: (this.theta_b_rad * 180) / math.pi,
        s: this.s,
      };
    }
  }

  calculateVelocity() {
    if (this.params.vel_m) {
    }
  }
}
