/**
 * The webpack loader for react component
 * 参考 https://github.com/webpack-contrib/style-loader/blob/master/src/index.js 实现
 * @author 余聪
 */
import { createPitch } from './create'

/**
 * Input: 'x-button'
 * export default () => <button></button>
 *
 * Output:
 * const Component = React.lazy(() => import('!!x-button'))
 * const Button = React.forward(function Button (props, ref) {
 *   return <Suspense>
 *     <Component ref={ref} {...props} />
 *   </Suspense>
 * })
 * export default Button
 *
 * @param request
 */
export const pitch = createPitch({
  lazyType: 'React.lazy'
})
